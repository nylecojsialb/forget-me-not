/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/forget-me-not
 */

import { settings } from "./lib/settings";
import { on, createElement } from "./lib/htmlUtils";
import { browser } from "webextension-polyfill-ts";
import * as punycode from "punycode";
import { RuleType, RuleDefinition } from "./lib/settingsSignature";

export function classNameForRuleType(ruleType: RuleType) {
    if (ruleType === RuleType.WHITE)
        return "badge_white";
    if (ruleType === RuleType.GRAY)
        return "badge_gray";
    if (ruleType === RuleType.BLOCK)
        return "badge_block";
    return "badge_forget";
}

export function setupRuleSelect(select: HTMLSelectElement, type: RuleType) {
    select.className = classNameForRuleType(type);
    createElement(document, select, "option", { className: "badge_white", value: RuleType.WHITE, textContent: browser.i18n.getMessage("setting_type_white"), title: browser.i18n.getMessage("setting_type_white@title") });
    createElement(document, select, "option", { className: "badge_gray", value: RuleType.GRAY, textContent: browser.i18n.getMessage("setting_type_gray"), title: browser.i18n.getMessage("setting_type_gray@title") });
    createElement(document, select, "option", { className: "badge_forget", value: RuleType.FORGET, textContent: browser.i18n.getMessage("setting_type_forget"), title: browser.i18n.getMessage("setting_type_forget@title") });
    createElement(document, select, "option", { className: "badge_block", value: RuleType.BLOCK, textContent: browser.i18n.getMessage("setting_type_block"), title: browser.i18n.getMessage("setting_type_block@title") });
    on(select, "change", () => select.className = classNameForRuleType(parseInt(select.value)));
    select.value = type.toString();
}

export class RuleListItem {
    public readonly labelNode: HTMLElement;
    public ruleDef: RuleDefinition;
    public readonly itemNode: HTMLElement;
    public readonly selectNode: HTMLSelectElement;
    public constructor(ruleDef: RuleDefinition, parent: HTMLElement) {
        this.ruleDef = ruleDef;
        this.itemNode = createElement(document, parent, "li");
        const punified = this.appendPunycode(ruleDef.rule);
        this.labelNode = createElement(document, this.itemNode, "div", { textContent: punified, title: punified });
        const label = createElement(document, this.itemNode, "label", { className: "type_column" });
        this.selectNode = createElement(document, label, "select");
        setupRuleSelect(this.selectNode, ruleDef.type);
        const button = createElement(document, this.itemNode, "button", { textContent: "X", className: "delete_column" });

        on(this.selectNode, "change", () => {
            const rules = settings.get("rules").slice();
            const rule = rules.find((r) => r.rule === this.ruleDef.rule);
            if (rule) {
                rule.type = parseInt(this.selectNode.value);
                settings.set("rules", rules);
                settings.save();
            }
        });
        on(button, "click", () => {
            const rules = settings.get("rules").slice();
            const index = rules.findIndex((r) => r.rule === this.ruleDef.rule);
            if (index !== -1) {
                rules.splice(index, 1);
                settings.set("rules", rules);
                settings.save();
            }
        });
    }

    public isRule(ruleDef: RuleDefinition) {
        return this.ruleDef.rule === ruleDef.rule;
    }

    private appendPunycode(rule: string) {
        const punified = punycode.toUnicode(rule);
        return (punified === rule) ? rule : `${rule} (${punified})`;
    }

    public updateRule(ruleDef: RuleDefinition) {
        this.ruleDef = ruleDef;
        this.selectNode.value = ruleDef.type.toString();
        this.selectNode.className = classNameForRuleType(ruleDef.type);
        const punified = this.appendPunycode(ruleDef.rule);
        this.labelNode.textContent = punified;
        this.labelNode.title = punified;
    }
}
