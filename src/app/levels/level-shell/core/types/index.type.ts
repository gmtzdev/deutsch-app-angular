type CreatingState =
    | { type: 'none' }
    | { type: 'topic' }
    | { type: 'subtopic'; topicId: number };