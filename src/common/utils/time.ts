export const convertToSeconds = (duration: string): number => {
  const durationRegex = /(\d+)([dhms])/g;
  const matches = duration.match(durationRegex);

  if (!matches) {
    throw new Error('Invalid duration format');
  }

  return matches.reduce((totalSeconds, match) => {
    const value = parseInt(match.slice(0, -1), 10);
    const unit = match.slice(-1);

    switch (unit) {
      case 'd':
        return totalSeconds + value * 24 * 60 * 60;
      case 'h':
        return totalSeconds + value * 60 * 60;
      case 'm':
        return totalSeconds + value * 60;
      case 's':
        return totalSeconds + value;
      default:
        throw new Error('Invalid unit in duration');
    }
  }, 0);
};
