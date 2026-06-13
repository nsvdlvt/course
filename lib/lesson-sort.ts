type SortableLesson = {
  position?: number | null;
  title?: string | null;
};

function getLessonTitleNumber(title?: string | null) {
  const match = title?.trim().match(/^[A-Za-z]+\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

export function sortLessonsByDisplayOrder<T extends SortableLesson>(
  lessons: T[]
) {
  return [...lessons].sort((first, second) => {
    const firstTitleNumber = getLessonTitleNumber(first.title);
    const secondTitleNumber = getLessonTitleNumber(second.title);

    if (firstTitleNumber !== null && secondTitleNumber !== null) {
      return firstTitleNumber - secondTitleNumber;
    }

    if (firstTitleNumber !== null) {
      return -1;
    }

    if (secondTitleNumber !== null) {
      return 1;
    }

    return (first.position ?? 0) - (second.position ?? 0);
  });
}
