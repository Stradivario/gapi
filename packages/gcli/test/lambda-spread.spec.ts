import 'jest';

import { spreadScaleOptions } from '../src/commands/lambda/helpers/spread';

describe('[lambda spread across machines] (plan 33)', () => {
  it('sends nothing when not set (works against an older API)', () => {
    expect(spreadScaleOptions({}, {})).toEqual({});
    expect(spreadScaleOptions({}, undefined)).toEqual({});
  });

  it('reads the yaml and lets the flags win', () => {
    expect(
      spreadScaleOptions({}, { spread: 'machines', spreadStrict: true }),
    ).toEqual({ spread: 'machines', spreadStrict: true });
    expect(
      spreadScaleOptions(
        { spread: 'none', spreadStrict: 'false' },
        { spread: 'machines', spreadStrict: true },
      ),
    ).toEqual({ spread: 'none', spreadStrict: false });
  });

  it('refuses an unknown value', () => {
    expect(() => spreadScaleOptions({ spread: 'racks' })).toThrow(
      /machines' or 'none/,
    );
  });
});
