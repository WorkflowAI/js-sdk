import { DATETIME_LOCAL } from './datetime-local.js';

describe('DATETIME_LOCAL', () => {
  it('should pass for valid data', () => {
    const data = {
      date: '2022-01-01',
      local_time: '12:00:00',
      timezone: 'UTC',
    };

    const result = DATETIME_LOCAL.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('should fail for invalid date', () => {
    const data = {
      date: 'invalid-date',
      local_time: '12:00:00',
      timezone: 'UTC',
    };

    const result = DATETIME_LOCAL.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('should fail for invalid time', () => {
    const data = {
      date: '2022-01-01',
      local_time: 'invalid-time',
      timezone: 'UTC',
    };

    const result = DATETIME_LOCAL.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('should fail for missing timezone', () => {
    const data = {
      date: '2022-01-01',
      local_time: '12:00:00',
    };

    const result = DATETIME_LOCAL.safeParse(data);

    expect(result.success).toBe(false);
  });
});
