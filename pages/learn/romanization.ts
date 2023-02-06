interface englishCounterpart {
    sound:String;
    englishSounds:String[];
}
let ec = (sound:String, ...englishSounds:String[]) => {return {sound, englishSounds}}; //english counterpart
let ecs = [ //english counterparts
// அ க ள ப ற ம ன ட த ண ய ச ஞ ழ ர ல ங வ
// ஆ கா ளா பா றா மா னா டா தா ணா யா சா ஞா ழா ரா லா ஙா வா
    
ec("அ", "a"),
ec("க", "ga", "ka"),
ec("ற", "ra"),
ec("ள", "la"),
ec("ம", "ma"),
ec("ன", "na"),
ec("ண", "na"),
ec("ய", "ya"),
ec("ச", "cha", "sa"),
ec("ஞ", "nya", "nga"),
ec("ழ", "zha", "la"),
ec("ப", "pa", "ba"),

]
function Romanize(input:String, definition:String) {
    let ret:boolean = true;
    let curChar:number = 0;
    let curInp:number = 0;
    while (curChar < definition.length) {
        if (!ret) break; // if return is set to false then something doesn't match up, return false
        let found = ecs.find(d => d.sound == definition[curChar]); //find the matching englishCounterpart sound of the string in definition
        
        found?.englishSounds.forEach(i => { // loop through all english sounds
            if (input.slice(curInp, curInp + i.length) == i)  {
                curInp += i.length;
                ret = true;
                return; // if it matches with the part of the input we are on, continue to the next one
            } else {
                ret = false;
            }
        });
    }
    
    return ret;
}