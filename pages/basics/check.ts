import chars from "./chars";
export function checkDef(input: String, definition: String) {
  let ret: boolean = true;
  let curChar: number = 0;
  let curInp: number = 0;
  let curEnglish: string = "";
  let defArr = definition.match(/[\u0b80-\u0bff][\u0bbe-\u0bcd\u0bd7]?|\s/g) || [];
  while (curChar < defArr.length) {
    if (!ret) break;
    let found = chars.find((d) => d[0] == defArr[curChar]);
    let englishSounds = found?.slice(1);
    if (englishSounds)
      for (let c = 0; c < englishSounds.length; c++) {
        let i = englishSounds[c];
        curEnglish = input.slice(curInp, curInp + i.length);
        if (input.slice(curInp, curInp + i.length) == i) {
          curInp += i.length;
          ret = true;
          break;
        } else ret = false;
      }
    curChar++;
  }
  if (ret && input.length > curInp) {
    ret = false;
    curEnglish = input.slice(curInp++);
  }
  return { ret, curInp, curEnglish };
}
