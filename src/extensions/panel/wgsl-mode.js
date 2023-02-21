// Copied from
// https://github.com/google/tour-of-wgsl/blob/main/assets/third_party/codemirror/wgsl-mode.js

// Adapted from CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function (mod) {
  if (typeof exports == 'object' && typeof module == 'object')
    // CommonJS
    mod(require('codemirror/lib/codemirror'));
  else if (typeof define == 'function' && define.amd)
    // AMD
    define(['codemirror/lib/codemirror'], mod);
  // Plain browser env
  else mod(CodeMirror);
})(function (CodeMirror) {
  'use strict';

  let indentStep = 2;

  CodeMirror.defineMode('wgsl', function (config) {
    function simpleMode(states) {
      ensureState(states, 'start');
      var states_ = {},
        meta = states.languageData || {},
        hasIndentation = false;
      for (var state in states)
        if (state != meta && states.hasOwnProperty(state)) {
          var list = (states_[state] = []),
            orig = states[state];
          for (var i = 0; i < orig.length; i++) {
            var data = orig[i];
            list.push(new Rule(data, states));
            if (data.indent || data.dedent) hasIndentation = true;
          }
        }
      return {
        name: meta.name,
        startState() {
          return { state: 'start', pending: null, indent: hasIndentation ? [] : null };
        },
        copyState(state) {
          var s = {
            state: state.state,
            pending: state.pending,
            indent: state.indent && state.indent.slice(0),
          };
          if (state.stack) s.stack = state.stack.slice(0);
          return s;
        },
        token: tokenFunction(states_),
        indent: indentFunction(states_, meta),
        languageData: meta,
      };
    }

    function ensureState(states, name) {
      if (!states.hasOwnProperty(name))
        throw new Error('Undefined state ' + name + ' in simple mode');
    }

    function toRegex(val, caret) {
      if (!val) return /(?:)/;
      var flags = '';
      if (val instanceof RegExp) {
        if (val.ignoreCase) flags += 'i';
        if (val.unicode) flags += 'u';
        val = val.source;
      } else {
        val = String(val);
      }
      return new RegExp((caret === false ? '' : '^') + '(?:' + val + ')', flags);
    }

    function asToken(val) {
      // val is either a string or list of strings.
      if (!val) return null;
      if (val.apply) return val;
      if (typeof val == 'string') return val.replace(/\./g, ' ');
      var result = [];
      for (var i = 0; i < val.length; i++) result.push(val[i] && val[i].replace(/\./g, ' '));
      return result;
    }

    function Rule(data, states) {
      if (data.next || data.push) ensureState(states, data.next || data.push);
      this.regex = toRegex(data.regex);
      this.token = asToken(data.token);
      this.data = data;
    }

    function tokenFunction(states) {
      return function (stream, state) {
        if (state.pending) {
          var pend = state.pending.shift();
          if (state.pending.length == 0) state.pending = null;
          stream.pos += pend.text.length;
          return pend.token;
        }

        // Work like a pygments state matcher.
        // Do the work described by the first rule that matches.
        var curState = states[state.state];
        for (var i = 0; i < curState.length; i++) {
          var rule = curState[i];
          var matches = (!rule.data.sol || stream.sol()) && stream.match(rule.regex);
          if (matches) {
            if (rule.data.unreachable) {
              throw new Error('Reached unreachable rule: ' + rule.data.unreachable);
            }
            if (rule.data.next) {
              // Transition to the named state.
              state.state = rule.data.next;
            } else if (rule.data.push) {
              // Push current state onto the stack, and transition to the next
              // state.
              (state.stack || (state.stack = [])).push(state.state);
              state.state = rule.data.push;
            } else if (rule.data.pop && state.stack && state.stack.length) {
              // Pop.
              state.state = state.stack.pop();
            }

            if (rule.data.indent) state.indent.push(stream.indentation() + indentStep);
            if (rule.data.dedent) state.indent.pop();
            var token = rule.token;
            if (token && token.apply) token = token(matches);
            if (matches.length > 2 && rule.token && typeof rule.token != 'string') {
              state.pending = [];
              for (var j = 2; j < matches.length; j++)
                if (matches[j]) state.pending.push({ text: matches[j], token: rule.token[j - 1] });
              stream.backUp(matches[0].length - (matches[1] ? matches[1].length : 0));
              return token[0];
            } else if (token && token.join) {
              return token[0];
            } else {
              return token;
            }
          }
        }
        stream.next();
        return null;
      };
    }

    function indentFunction(states, meta) {
      return function (state, textAfter) {
        if (
          state.indent == null ||
          (meta.dontIndentStates && meta.dontIndentStates.indexOf(state.state) > -1)
        )
          return null;

        var pos = state.indent.length - 1,
          rules = states[state.state];
        scan: for (;;) {
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (rule.data.dedent && rule.data.dedentIfLineStart !== false) {
              var m = rule.regex.exec(textAfter);
              if (m && m[0]) {
                pos--;
                if (rule.next || rule.push) rules = states[rule.next || rule.push];
                textAfter = textAfter.slice(m[0].length);
                continue scan;
              }
            }
          }
          break;
        }
        return pos < 0 ? 0 : state.indent[pos];
      };
    }

    // Returns a list of empty strings, from a possibly multi-line string,
    // stripping blanks and line endings. Emulates Perls 'qw' function.
    function qw(str) {
      var result = [];
      var words = str.split(/\r+|\n+| +/);
      for (var i = 0; i < words.length; ++i) {
        if (words[i].length > 0) {
          result.push(words[i]);
        }
      }
      return result;
    }

    var keywords = qw(`
                  alias
                  break
                  case
                  const
                  const_assert
                  continue
                  continuing
                  default
                  diagnostic
                  discard
                  else
                  enable
                  false
                  fn
                  for
                  if
                  let
                  loop
                  override
                  requires
                  return
                  struct
                  switch
                  true
                  var
                  while
                  `);

    var reserved = qw(`
                  NULL
                  Self
                  abstract
                  active
                  alignas
                  alignof
                  as
                  asm
                  asm_fragment
                  async
                  attribute
                  auto
                  await
                  become
                  binding_array
                  cast
                  catch
                  class
                  co_await
                  co_return
                  co_yield
                  coherent
                  column_major
                  common
                  compile
                  compile_fragment
                  concept
                  const_cast
                  consteval
                  constexpr
                  constinit
                  crate
                  debugger
                  decltype
                  delete
                  demote
                  demote_to_helper
                  do
                  dynamic_cast
                  enum
                  explicit
                  export
                  extends
                  extern
                  external
                  fallthrough
                  filter
                  final
                  finally
                  friend
                  from
                  fxgroup
                  get
                  goto
                  groupshared
                  highp
                  impl
                  implements
                  import
                  inline
                  instanceof
                  interface
                  layout
                  lowp
                  macro
                  macro_rules
                  match
                  mediump
                  meta
                  mod
                  module
                  move
                  mut
                  mutable
                  namespace
                  new
                  nil
                  noexcept
                  noinline
                  nointerpolation
                  noperspective
                  null
                  nullptr
                  of
                  operator
                  package
                  packoffset
                  partition
                  pass
                  patch
                  pixelfragment
                  precise
                  precision
                  premerge
                  priv
                  protected
                  pub
                  public
                  readonly
                  ref
                  regardless
                  register
                  reinterpret_cast
                  require
                  resource
                  restrict
                  self
                  set
                  shared
                  sizeof
                  smooth
                  snorm
                  static
                  static_assert
                  static_cast
                  std
                  subroutine
                  super
                  target
                  template
                  this
                  thread_local
                  throw
                  trait
                  try
                  type
                  typedef
                  typeid
                  typename
                  typeof
                  union
                  unless
                  unorm
                  unsafe
                  unsized
                  use
                  using
                  varying
                  virtual
                  volatile
                  wgsl
                  where
                  with
                  writeonly
                  yield
                  `);

    var predeclared_enums = qw(`
            read write read_write
            function private workgroup uniform storage
            perspective linear flat
            center centroid sample
            vertex_index instance_index position front_facing frag_depth
                local_invocation_id local_invocation_index
                global_invocation_id workgroup_id num_workgroups
                sample_index sample_mask
            rgba8unorm
            rgba8snorm
            rgba8uint
            rgba8sint
            rgba16uint
            rgba16sint
            rgba16float
            r32uint
            r32sint
            r32float
            rg32uint
            rg32sint
            rg32float
            rgba32uint
            rgba32sint
            rgba32float
            bgra8unorm
  `);

    var predeclared_types = qw(`
            bool
            f16
            f32
            i32
            sampler sampler_comparison
            texture_depth_2d
            texture_depth_2d_array
            texture_depth_cube
            texture_depth_cube_array
            texture_depth_multisampled_2d
            texture_external
            texture_external
            u32
            `);

    var predeclared_type_generators = qw(`
            array
            atomic
            mat2x2
            mat2x3
            mat2x4
            mat3x2
            mat3x3
            mat3x4
            mat4x2
            mat4x3
            mat4x4
            ptr
            texture_1d
            texture_2d
            texture_2d_array
            texture_3d
            texture_cube
            texture_cube_array
            texture_multisampled_2d
            texture_storage_1d
            texture_storage_2d
            texture_storage_2d_array
            texture_storage_3d
            vec2
            vec3
            vec4
            `);

    var predeclared_type_aliases = qw(`
            vec2i vec3i vec4i
            vec2u vec3u vec4u
            vec2f vec3f vec4f
            vec2h vec3h vec4h
            mat2x2f mat2x3f mat2x4f
            mat3x2f mat3x3f mat3x4f
            mat4x2f mat4x3f mat4x4f
            mat2x2h mat2x3h mat2x4h
            mat3x2h mat3x3h mat3x4h
            mat4x2h mat4x3h mat4x4h
            `);

    var predeclared_intrinsics = qw(`
      bitcast all any select arrayLength abs acos acosh asin asinh atan atanh atan2
      ceil clamp cos cosh countLeadingZeros countOneBits countTrailingZeros cross
      degrees determinant distance dot exp exp2 extractBits faceForward firstLeadingBit
      firstTrailingBit floor fma fract frexp inverseBits inverseSqrt ldexp length
      log log2 max min mix modf normalize pow quantizeToF16 radians reflect refract
      reverseBits round saturate sign sin sinh smoothstep sqrt step tan tanh transpose
      trunc dpdx dpdxCoarse dpdxFine dpdy dpdyCoarse dpdyFine fwidth fwidthCoarse fwidthFine
      textureDimensions textureGather textureGatherCompare textureLoad textureNumLayers
      textureNumLevels textureNumSamples textureSample textureSampleBias textureSampleCompare
      textureSampleCompareLevel textureSampleGrad textureSampleLevel textureSampleBaseClampToEdge
      textureStore atomicLoad atomicStore atomicAdd atomicSub atomicMax atomicMin
      atomicAnd atomicOr atomicXor atomicExchange atomicCompareExchangeWeak pack4x8snorm
      pack4x8unorm pack2x16snorm pack2x16unorm pack2x16float unpack4x8snorm unpack4x8unorm
      unpack2x16snorm unpack2x16unorm unpack2x16float storageBarrier workgroupBarrier
      workgroupUniformLoad
    `);

    // Treat '_' and regular identifiers the same.
    var ident_like = /^[_\p{XID_Start}]\p{XID_Continue}*/u;

    // Converts a list of strings to a regexp to match any word in that list.
    function list2re(strings) {
      return new RegExp('^(?:' + strings.join('|') + ')\\b');
    }

    var comment_rules = [
      { regex: /^\s+/, token: 'space' },
      { regex: /^\/\/.*/, token: 'comment' },
      { regex: /^\/\*/, token: 'comment', push: 'blockComment' },
    ];

    const wgsl_states = {
      languageData: {
        name: 'wgsl',
        dontIndentStates: ['blockComment'],
      },
      start: [
        ...comment_rules,
        { regex: /^@/, token: 'meta', push: 'attribute' },

        // Keywords
        { regex: /^(true|false)\b/, token: 'atom' }, // Should this be builtin?
        { regex: list2re(keywords), token: 'keyword' },
        { regex: list2re(reserved), token: 'keyword' },

        // Intrinsic functions
        { regex: list2re(predeclared_intrinsics), token: 'intrinsic' },

        // Predeclared names.
        { regex: list2re(predeclared_enums), token: 'variable-3' },
        { regex: list2re(predeclared_types), token: 'variable-2' },
        { regex: list2re(predeclared_type_generators), token: 'variable-2' },
        { regex: list2re(predeclared_type_aliases), token: 'variable-2' },

        // Decimal float literals
        // https://www.w3.org/TR/WGSL/#syntax-decimal_float_literal
        // 0, with type-specifying suffix.
        { regex: /^0[fh]/, token: 'number' },
        // Other decimal integer, with type-specifying suffix.
        { regex: /^[1-9][0-9]*[fh]/, token: 'number' },
        // Has decimal point, at least one digit after decimal.
        { regex: /^[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?[fh]?/, token: 'number' },
        // Has decimal point, at least one digit before decimal.
        { regex: /^[0-9]+\.[0-9]*([eE][+-]?[0-9]+)?[fh]?/, token: 'number' },
        // Has at least one digit, and has an exponent.
        { regex: /^[0-9]+[eE][+-]?[0-9]+[fh]?/, token: 'number' },

        // Hex float literals
        // https://www.w3.org/TR/WGSL/#syntax-hex_float_literal
        { regex: /^0[xX][0-9a-fA-F]*\.[0-9a-fA-F]+(?:[pP][+-]?[0-9]+[fh]?)?/, token: 'number' },
        { regex: /^0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*(?:[pP][+-]?[0-9]+[fh]?)?/, token: 'number' },
        { regex: /^0[xX][0-9a-fA-F]+[pP][+-]?[0-9]+[fh]?/, token: 'number' },

        // Hexadecimal integer literals
        // https://www.w3.org/TR/WGSL/#syntax-hex_int_literal
        { regex: /^0[xX][0-9a-fA-F]+[iu]?/, token: 'number' },

        // Decimal integer literals
        // https://www.w3.org/TR/WGSL/#syntax-decimal_int_literal
        // We need two rules here because 01 is not valid.
        { regex: /^[1-9][0-9]*[iu]?\b/, token: 'number' },
        { regex: /^0[iu]?\b/, token: 'number' }, // Must match last

        // Indentation
        { regex: /^[\{\[\(]/, token: 'operator', indent: true },
        { regex: /^[\}\]\)]/, token: 'operator', dedent: true },

        // Operators and Punctuation
        { regex: /^[,\.;:]/, token: 'operator' },
        { regex: /^[+\-*/%&|<>^!~=]+/, token: 'operator' },

        { regex: ident_like, token: 'variable' },

        // Uncomment the following to help debug problems recognizing tokens
        // { regex: /()/, token: 'unreachable', unreachable: 'end of root list' },
      ],
      blockComment: [
        // Soak up uninteresting text
        { regex: RegExp('^[^*/]+'), token: 'comment' },
        // Recognize the start of a block comment
        { regex: RegExp('^/\\*'), token: 'comment', push: 'blockComment' },
        // Recognize the end of a block comment
        { regex: RegExp('^\\*/'), token: 'comment', pop: true },
        // Soak up stray * and /
        { regex: RegExp('^[*/]'), token: 'comment' },
      ],
      attribute: [
        ...comment_rules,
        { regex: /^\w+/, token: 'meta', pop: true },
        // Empty match. to pop the stack.
        { regex: /^()/, token: 'punctuation', pop: true },
      ],
    };

    return simpleMode(wgsl_states);
  });

  CodeMirror.defineMIME('text/wgsl', 'wgsl');
});
