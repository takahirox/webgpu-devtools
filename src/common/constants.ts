export type ResourceId = number;

export enum EncoderState {
  open,
  locked,
  ended
};

export const stringifyEncoderState = (state: EncoderState): string => {
  switch (state) {
    case EncoderState.open:
      return 'open';
    case EncoderState.locked:
      return 'locked';
    case EncoderState.ended:
      return 'ended';
  }
};
