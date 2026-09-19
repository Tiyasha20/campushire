export const evaluateEligibility = (studentProfile, job) => {
  const reasons = [];

  if (studentProfile.cgpa < job.minCgpa) {
    reasons.push(
      `CGPA requirement not met: Required ${job.minCgpa}, but student has ${studentProfile.cgpa}.`
    );
  }

  if (studentProfile.activeBacklogs > job.maxBacklogs) {
    reasons.push(
      `Backlog limit exceeded: Max allowed is ${job.maxBacklogs}, but student has ${studentProfile.activeBacklogs}.`
    );
  }

  if (!job.eligibleDepts.includes(studentProfile.department)) {
    reasons.push(
      `Department not eligible: Allowed departments are [${job.eligibleDepts.join(', ')}].`
    );
  }

  if (!job.eligibleBatches.includes(studentProfile.batch)) {
    reasons.push(
      `Graduation batch not eligible: Allowed batches are [${job.eligibleBatches.join(', ')}].`
    );
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};