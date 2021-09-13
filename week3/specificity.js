const specificityType = {
  inline: 0,
  id: 1,
  class: 2,
  tag: 3
};

function specificity(selector) {
  let p = [0, 0, 0, 0];
  let selectorParts = selector.split(" ");
  for (let part of selectorParts) {
    if (part.charAt(0) === "#") {
      p[specificityType.id] += 1;
    } else if (part.charAt(0) === ".") {
      p[specificityType.class] += 1;
    } else {
      p[specificityType.tag] += 1;
    }
  }

  return p;
}

function compare(sp1, sp2) {
  if (sp1[specificityType.inline] - sp2[specificityType.inline]) {
    return sp1[specificityType.inline] - sp2[specificityType.inline];
  }

  if (sp1[specificityType.id] - sp2[specificityType.id]) {
    return sp1[specificityType.id] - sp2[specificityType.id];
  }

  if (sp1[specificityType.class] - sp2[specificityType.class]) {
    return sp1[specificityType.class] - sp2[specificityType.class];
  }

  return sp1[specificityType.tag] - sp2[specificityType.tag];
}

module.exports = {
  specificity,
  compare
};
