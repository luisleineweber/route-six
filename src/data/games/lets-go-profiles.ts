export function letsGoProfiles<T extends { forms?: { formId: string }[] }>(
  profiles: T[],
  otherPartner: string,
) {
  return profiles.map(profile => {
    if (!profile.forms?.some(form => form.formId === otherPartner)) return profile;
    const { forms, ...base } = profile;
    const remaining = forms.filter(form => form.formId !== otherPartner);
    return remaining.length ? { ...base, forms: remaining } : base;
  });
}
