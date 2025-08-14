export function timeAgo(inputDate) {
  const now = new Date();
  const date = new Date(inputDate);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (isNaN(diffInSeconds)) return 'Invalid date';

  if (diffInSeconds < 60) return 'Just now';

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}