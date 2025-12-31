/**
 * Test: Stress Detector - Deterministic
 * 
 * Misma entrada → mismo StressMode
 * 
 * El StressDetector debe ser determinista:
 * para la misma señal Nectar, debe generar el mismo StressMode.
 */

import { describe, it, expect } from '@jest/globals';
import { StressDetector } from '../src/stress/StressDetector';
import { NectarContext } from '../src/nectar/NectarContext';
import { Clock } from '../src/runtime/clock';

describe('stress_detector_deterministic', () => {
  it('debe generar el mismo StressMode para la misma señal Nectar', () => {
    const clock = new Clock();
    const detector = new StressDetector(clock);

    const nectarContextHigh: NectarContext = {
      signal: 'HIGH',
      computedAt: clock.now()
    };

    const nectarContextLow: NectarContext = {
      signal: 'LOW',
      computedAt: clock.now()
    };

    const nectarContextMedium: NectarContext = {
      signal: 'MEDIUM',
      computedAt: clock.now()
    };

    // HIGH → PRESSURE
    const result1 = detector.detect(nectarContextHigh);
    const result2 = detector.detect(nectarContextHigh);
    expect(result1.mode).toBe('PRESSURE');
    expect(result2.mode).toBe('PRESSURE');
    expect(result1.mode).toBe(result2.mode);

    // LOW → NORMAL
    const result3 = detector.detect(nectarContextLow);
    const result4 = detector.detect(nectarContextLow);
    expect(result3.mode).toBe('NORMAL');
    expect(result4.mode).toBe('NORMAL');
    expect(result3.mode).toBe(result4.mode);

    // MEDIUM → NORMAL
    const result5 = detector.detect(nectarContextMedium);
    const result6 = detector.detect(nectarContextMedium);
    expect(result5.mode).toBe('NORMAL');
    expect(result6.mode).toBe('NORMAL');
    expect(result5.mode).toBe(result6.mode);
  });

  it('debe generar NORMAL cuando no hay NectarContext', () => {
    const clock = new Clock();
    const detector = new StressDetector(clock);

    const result1 = detector.detect(undefined);
    const result2 = detector.detect(undefined);

    expect(result1.mode).toBe('NORMAL');
    expect(result2.mode).toBe('NORMAL');
    expect(result1.mode).toBe(result2.mode);
  });
});

