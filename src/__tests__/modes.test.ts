import { describe, it, expect } from 'vitest';
import { STUDY_MODES, STUDY_MODE_KEYS } from '../data/modes';
import { DEMO_RESPONSES } from '../data/demoResponses';

describe('Study Modes Configuration', () => {
  it('should define all 4 required academic study modes', () => {
    expect(STUDY_MODE_KEYS).toHaveLength(4);
    expect(STUDY_MODE_KEYS).toContain('concept-explainer');
    expect(STUDY_MODE_KEYS).toContain('code-debugger');
    expect(STUDY_MODE_KEYS).toContain('math-solver');
    expect(STUDY_MODE_KEYS).toContain('exam-revision');
  });

  it('each mode should have non-empty metadata and suggested prompts', () => {
    STUDY_MODE_KEYS.forEach((modeKey) => {
      const mode = STUDY_MODES[modeKey];
      expect(mode).toBeDefined();
      expect(mode.name.length).toBeGreaterThan(0);
      expect(mode.description.length).toBeGreaterThan(0);
      expect(mode.suggestedPrompts.length).toBeGreaterThanOrEqual(2);
      mode.suggestedPrompts.forEach((card) => {
        expect(card.title).toBeDefined();
        expect(card.prompt).toBeDefined();
        expect(card.subject).toBeDefined();
      });
    });
  });

  it('demo response bank should have entries for all modes', () => {
    STUDY_MODE_KEYS.forEach((modeKey) => {
      const demos = DEMO_RESPONSES[modeKey];
      expect(demos).toBeDefined();
      expect(demos.length).toBeGreaterThanOrEqual(1);
      demos.forEach((demo) => {
        expect(demo.title).toBeDefined();
        expect(demo.title.length).toBeGreaterThan(0);
        expect(demo.response.length).toBeGreaterThan(100);
      });
    });
  });
});
