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

  ec("க்", "ga", "ka"),
  ec("த்", "tha"),
  ec("ட்", "da", "ta"),

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
  
  ec("ஆ", "i"),
  ec("பா", "paa", "baa", "ba", "pa"),
  ec("மா", "maa", "ma"),

  ec("கா", "gaa", "kaa", "ga", "ka"),
  ec("தா", "thaa", "tha"),
  ec("டா", "daa", "taa", "ta", "da"),

  ec("னா", "naa", "na"),
  ec("ணா", "naa", "na"),
  ec("நா", "naa", "na"),
  
];
export function romanize(input: String, definition: String) {
  let ret: boolean = true;
  let curChar: number = 0;
  let curInp: number = 0;
  while (curChar < definition.length) {
    if (!ret) break; // if return is set to false then something doesn't match up, return false
    let found = ecs.find((d) => d.sound == definition[curChar]); //find the matching englishCounterpart sound of the string in definition

    found?.englishSounds.forEach((i) => {
      // loop through all english sounds
      if (input.slice(curInp, curInp + i.length) == i) {
        curInp += i.length;
        ret = true;
        return; // if it matches with the part of the input we are on, continue to the next one
      } else {
        ret = false;
      }
    });
    curChar++;
  }

  return ret;
}

