interface englishCounterpart {
  sound: String;
  englishSounds: String[];
}
let ec = (sound: String, ...englishSounds: String[]) => {
  return { sound, englishSounds };
}; //english counterpart
let ecs = [
  //english counterparts
  
  ec("ப்", "p", "b"),
  ec("ம்", "m"),

  ec("க்", "g", "k"),
  ec("த்", "th"),
  ec("ட்", "d", "t"),

  ec("ன்", "n"),
  ec("ண்", "n"),
  ec("ந்", "n"),

  ec("அ", "a"),
  ec("ப", "pa", "ba"),
  ec("ம", "ma"),

  ec("க", "ga", "ka"),
  ec("த", "tha"),
  ec("ட", "da", "ta"),

  ec("ன", "na"),
  ec("ண", "na"),
  ec("ந", "na"),
  
  ec("ஆ", "aa", "a"),
  ec("பா", "paa", "baa", "ba", "pa"),
  ec("மா", "maa", "ma"),

  ec("கா", "gaa", "kaa", "ga", "ka"),
  ec("தா", "thaa", "tha"),
  ec("டா", "daa", "taa", "ta", "da"),

  ec("னா", "naa", "na"),
  ec("ணா", "naa", "na"),
  ec("நா", "naa", "na"),
  
  ec("இ", "i"),
  ec("பி", "pi", "bi"),
  ec("மி", "mi"),

  ec("கி", "gi", "ki"),
  ec("தி", "thi"),
  ec("டி", "di", "ti"),

  ec("னி", "ni"),
  ec("ணி", "ni"),
  ec("நி", "ni"),
  
];
export function romanize(input: String, definition: String) {
  let ret: boolean = true;
  let curChar: number = 0;
  let curInp: number = 0;
  let defArr = definition.match(/[\u0b80-\u0bff][\u0bbe-\u0bcd\u0bd7]?/g) || [];
  
  while (curChar < defArr.length) {
    if (!ret) break; // if return is set to false then something doesn't match up, return false
    let found = ecs.find((d) => d.sound == defArr[curChar]); //find the matching englishCounterpart sound of the string in definition
    
    if (found) for (let c = 0; c < found?.englishSounds.length; c++) {
      // loop through all english sounds
      let i = found?.englishSounds[c];
      if (input.slice(curInp, curInp + i.length) == i) {
        curInp += i.length;
        ret = true;
        break; // if it matches with the part of the input we are on, continue to the next one
      } else ret = false;
    }
    curChar++;
  }

  return ret;
}
