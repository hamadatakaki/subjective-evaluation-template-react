export function toNaturalnessMosLabel(value: number) {
  if (value === 5) {
    // '非常に自然で、人間の発話と区別がつかない'
    return 'Very natural; indistinguishable from human speech'
  }
  if (value === 4) {
    // '自然で、ほとんど違和感がない'
    return 'Mostly natural; little to no noticeable unnaturalness'
  }
  if (value === 3) {
    // 'やや不自然な点はあるが、許容範囲である'
    return 'Somewhat unnatural but still acceptable'
  }
  if (value === 2) {
    // '不自然さが目立ち、聞き取りにくい部分がある'
    return 'Noticeably unnatural; some parts are difficult to understand'
  }
  if (value === 1) {
    // '非常に不自然で、強い違和感がある'
    return 'Highly unnatural; strong artifacts or discomfort'
  }

  return ''
}
