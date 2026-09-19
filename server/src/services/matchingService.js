const normalizeSkill = (skill = '') => {
  let value = skill
    .toLowerCase()
    .trim()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ');

  // Common skill aliases
  const aliases = {
    'react js': 'react',
    'reactjs': 'react',
    'react.js': 'react',

    'node': 'node js',
    'nodejs': 'node js',
    'node.js': 'node js',

    'expressjs': 'express',
    'express.js': 'express',

    'postgres': 'postgresql',
    'postgres db': 'postgresql',
    'postgres database': 'postgresql',

    'js': 'javascript',

    'html5': 'html',
    'css3': 'css',

    'mongo': 'mongodb',
    'mongo db': 'mongodb',
  };

  return aliases[value] || value;
};

export const evaluateResumeSkills = (
  resumeText = '',
  mandatorySkills = [],
  preferredSkills = []
) => {
  const normalizedText = resumeText
    .toLowerCase()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ');

  const matchSkill = (skill) => {
    const normalizedSkill = normalizeSkill(skill);

    // Create variants that can be searched in the resume
    const variants = [skill];

    if (normalizedSkill === 'react') {
      variants.push('react', 'react.js', 'reactjs', 'react js');
    }

    if (normalizedSkill === 'node js') {
      variants.push('node', 'node.js', 'nodejs', 'node js');
    }

    if (normalizedSkill === 'postgresql') {
      variants.push('postgres', 'postgresql', 'postgres db');
    }

    if (normalizedSkill === 'javascript') {
      variants.push('javascript', 'js');
    }

    if (normalizedSkill === 'mongodb') {
      variants.push('mongodb', 'mongo db', 'mongo');
    }

    return variants.some((variant) => {
      const normalizedVariant = variant
        .toLowerCase()
        .replace(/[._-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const escaped = normalizedVariant.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const regex = new RegExp(`\\b${escaped}\\b`, 'i');

      return regex.test(normalizedText);
    });
  };

  const matchedMandatory = mandatorySkills.filter(matchSkill);

  const missingMandatory = mandatorySkills.filter(
    (skill) => !matchedMandatory.includes(skill)
  );

  const matchedPreferred = preferredSkills.filter(matchSkill);

  const missingPreferred = preferredSkills.filter(
    (skill) => !matchedPreferred.includes(skill)
  );

  const allRequired = [
    ...new Set([...mandatorySkills, ...preferredSkills]),
  ];

  const allMatched = [
    ...new Set([...matchedMandatory, ...matchedPreferred]),
  ];

  const matchScore =
    allRequired.length > 0
      ? Math.round((allMatched.length / allRequired.length) * 100)
      : 100;

  return {
    matchScore,
    canApply: missingMandatory.length === 0,

    matchedSkills: allMatched,

    insights: {
      mandatory: {
        matched: matchedMandatory,
        missing: missingMandatory,
      },

      preferred: {
        matched: matchedPreferred,
        missing: missingPreferred,
      },
    },
  };
};