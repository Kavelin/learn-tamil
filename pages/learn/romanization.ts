//english counterpart
export function romanize(input: String, definition: String) {
  interface englishCounterpart {
    sound: String;
    englishSounds: String[];
  }
  let ret: boolean = true;
  let curChar: number = 0;
  let curInp: number = 0;
  let defArr = definition.match(/[\u0b80-\u0bff][\u0bbe-\u0bcd\u0bd7]?/g) || [];
  let ec = (sound: String, ...englishSounds: String[]) => {
    return { sound, englishSounds };
  };
  while (curChar < defArr.length) {
    if (!ret) break;
    let found = [
      //english counterparts

      ec("ப்", "p", "b"),
      ec("ம்", "m"),

      ec("க்", "g", "k"),
      ec("த்", "th"),
      ec("ட்", "d", "t"),

      ec("ன்", "n"),
      ec("ண்", "n"),
      ec("ந்", "n"),

      ec("ர்", "r"),
      ec("ற்", "r", "t"),

      ec("அ", "a"),
      ec("ப", "pa", "ba"),
      ec("ம", "ma"),

      ec("க", "ga", "ka"),
      ec("த", "tha"),
      ec("ட", "da", "ta"),

      ec("ன", "na"),
      ec("ண", "na"),
      ec("ந", "na"),

      ec("ர", "ra"),
      ec("ற", "ra"),

      ec("ஆ", "aa", "a"),
      ec("பா", "paa", "baa", "ba", "pa"),
      ec("மா", "maa", "ma"),

      ec("கா", "gaa", "kaa", "ga", "ka"),
      ec("தா", "thaa", "tha"),
      ec("டா", "daa", "taa", "ta", "da"),

      ec("னா", "naa", "na"),
      ec("ணா", "naa", "na"),
      ec("நா", "naa", "na"),

      ec("றா", "raa", "ra"),
      ec("ரா", "raa", "ra"),

      ec("இ", "i"),
      ec("பி", "pi", "bi"),
      ec("மி", "mi"),

      ec("கி", "gi", "ki"),
      ec("தி", "thi"),
      ec("டி", "di", "ti"),

      ec("னி", "ni"),
      ec("ணி", "ni"),
      ec("நி", "ni"),

      ec("றி", "ri"),
      ec("ரி", "ri"),

      ec("ஈ", "ee"),
      ec("பீ", "pee", "bee"),
      ec("மீ", "mee"),

      ec("கீ", "gee", "kee"),
      ec("தீ", "thee"),
      ec("டீ", "dee", "tee"),

      ec("னீ", "nee"),
      ec("ணீ", "nee"),
      ec("நீ", "nee"),

      ec("றீ", "ree"),
      ec("ரீ", "ree"),
    ].find((d) => d.sound == defArr[curChar]);

    if (found)
      for (let c = 0; c < found?.englishSounds.length; c++) {
        let i = found?.englishSounds[c];
        if (input.slice(curInp, curInp + i.length) == i) {
          curInp += i.length;
          ret = true;
          break;
        } else ret = false;
      }
    curChar++;
  }
  return ret;
}
