let a = "my name is eminem and i'm here to say";
let index = a.search("eminem");
console.log(a);
console.log(index);
console.log(a.substring(a.search("eminem")));
a[index] = "big boy ";
var output = [a.slice(0, index), "big boy ", a.slice(index)].join("");
console.log(output);
