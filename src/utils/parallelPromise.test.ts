import parallelPromise from './parallelPromise';
import wait from './wait';

const waitDelay = 100;
const margin = waitDelay / 2;

describe('parallelPromise', () => {
  it('should not parallelize', async () => {
    const elements = [1, 2, 3, 4];
    const start = Date.now();
    await parallelPromise(() => wait(waitDelay))(elements, 1);
    const end = Date.now();

    const diff = end - start;
    expect(diff).toBeGreaterThan(waitDelay * elements.length - margin);
    expect(diff).toBeLessThan(waitDelay * elements.length + margin);
  });

  it('should parallelize', async () => {
    const elements = [1, 2, 3, 4];
    const start = Date.now();
    await parallelPromise(() => wait(waitDelay))(elements, 2);
    const end = Date.now();

    const diff = end - start;
    expect(diff).toBeGreaterThan(waitDelay * (elements.length / 2) - margin);
    expect(diff).toBeLessThan(waitDelay * (elements.length / 2) + margin);
  });
});
