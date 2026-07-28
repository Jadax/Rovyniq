import type { InterviewAnswer, InterviewAnswerValue } from "../../canonical-tax-model/src/index.ts";
import { sections } from "./sections.ts";

export { sections } from "./sections.ts";

export type { QuestionSection, QuestionField, InterviewAnswer, InterviewAnswerValue } from "../../canonical-tax-model/src/index.ts";

export interface InterviewState {
  answers: Record<string, InterviewAnswerValue>;
  sections: Record<string, "locked" | "gate" | "active" | "completed">;
  activeSectionId: string | null;
  activeInstance: number;
}

export function getGateKey(sectionId: string): string {
  const section = sections.find((s) => s.id === sectionId);
  return section?.gateQuestion.id ?? `${sectionId}_gate`;
}

export function isGateAnswered(sectionId: string, answers: Record<string, InterviewAnswerValue>): boolean {
  const key = getGateKey(sectionId);
  return answers[key] !== undefined && answers[key] !== null;
}

export function isGateYes(sectionId: string, answers: Record<string, InterviewAnswerValue>): boolean {
  const key = getGateKey(sectionId);
  return answers[key] === true || answers[key] === "yes";
}

export function computeState(
  answers: Record<string, InterviewAnswerValue>,
  activeSectionId: string | null,
  activeInstance: number
): InterviewState {
  const sectionStates: Record<string, "locked" | "gate" | "active" | "completed"> = {};
  let foundActive = false;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const gateAnswered = isGateAnswered(section.id, answers);

    if (!foundActive && !gateAnswered) {
      sectionStates[section.id] = "gate";
      if (!activeSectionId || activeSectionId === section.id) {
        foundActive = true;
        activeSectionId = section.id;
      }
    } else if (!foundActive && gateAnswered && isGateYes(section.id, answers)) {
      sectionStates[section.id] = "completed";
    } else if (!foundActive && gateAnswered && !isGateYes(section.id, answers)) {
      sectionStates[section.id] = "completed";
    } else if (!foundActive) {
      sectionStates[section.id] = "locked";
    } else {
      sectionStates[section.id] = "locked";
    }
  }

  if (!foundActive) {
    sectionStates[sections[sections.length - 1]?.id ?? ""] = "completed";
  }

  const section = sections.find((s) => s.id === activeSectionId);
  if (section && activeInstance > 0 && sectionStates[activeSectionId] === "completed") {
    sectionStates[activeSectionId] = "active";
  }

  return { answers, sections: sectionStates, activeSectionId, activeInstance };
}

export function flattenSectionFields(
  sectionId: string,
  instance: number
): string[] {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return [];
  return section.fields.map((f) => instance > 0 ? `${sectionId}_${instance}_${f.id}` : `${sectionId}_${f.id}`);
}

export function instanceKey(sectionId: string, instance: number, fieldId?: string): string {
  if (fieldId) {
    return instance > 0 ? `${sectionId}_${instance}_${fieldId}` : `${sectionId}_${fieldId}`;
  }
  return instance > 0 ? `${sectionId}_${instance}` : sectionId;
}

export function getSectionLabel(sectionId: string, instance: number): string {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return "";
  if (instance === 0) return section.title;
  const label = section.multipleLabel ?? section.title;
  return `#${instance} ${label}`;
}
