// Durstenfeld shuffle algorithm
const shuffle = <T extends Array<any>>(initialArray: T): T => {
  const array = [...initialArray];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array as T;
};

export default shuffle;
