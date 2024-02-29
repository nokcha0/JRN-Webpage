var rowNum = ['`','1','2','3','4','5','6','7','8','9','0','-','='];
var row1 = ['q','w','e','r','t','y','u','i','o','p','[',']','\\'];
var row2 = ['a','s','d','f','g','h','j','k','l',';','\''];
var row3 = ['z','x','c','v','b','n','m',',','.','/'];

var crowNum = ['~','!','@','#','$','%','^','&','*','(',')','_','+'];
var crow1 = ['Q','W','E','R','T','Y','U','I','O','P','{','}','|'];
var crow2 = ['A','S','D','F','G','H','J','K','L',':','\"'];
var crow3 = ['Z','X','C','V','B','N','M','<','>','?'];

var inputText = document.getElementById("inputText");
var result = document.getElementById("result");

var encryptionInput = document.getElementById("encryptionInput");
var decryptionInput = document.getElementById("decryptionInput");
var encryptionResult = document.getElementById("encryptionResult");
var decryptionResult = document.getElementById("decryptionResult");

var encryptionForm = document.getElementById("encryptionForm");
var decryptionForm = document.getElementById("decryptionForm");

encryptionForm.addEventListener('submit', function(event) {
    event.preventDefault();
    encrypt();
});

decryptionForm.addEventListener('submit', function(event) {
    event.preventDefault();
    decrypt();
});


function encrypt() {
    var input = encryptionInput.value;
    var output = "";

    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        output += getEncryptedChar(char);
    }
    
    encryptionResult.innerHTML = output;
    document.getElementById('encryptionOutput').style.display = 'flex';
}

function decrypt() {
    var input = decryptionInput.value;
    var output = "";

    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        output += getDecryptedChar(char);
    }

    decryptionResult.innerHTML = output;
    document.getElementById('decryptionOutput').style.display = 'flex';
}

function getEncryptedChar(char) {
    if (char == ' ') return char;
    else if (char == '=') return '`';
    else if (char == '\\') return 'q';
    else if (char == '\'') return 'a';
    else if (char == '/') return 'z';
    else if (char == '+') return '~';
    else if (char == '|') return 'Q';
    else if (char == '"') return 'A';
    else if (char == '?') return 'Z';

    var index;
    if ((index = row1.indexOf(char)) !== -1) return row1[index+1];
    else if ((index = row2.indexOf(char)) !== -1) return row2[index+1];
    else if ((index = row3.indexOf(char)) !== -1) return row3[index+1];
    else if ((index = rowNum.indexOf(char)) !== -1) return rowNum[index+1];
    else if ((index = crow1.indexOf(char)) !== -1) return crow1[index+1];
    else if ((index = crow2.indexOf(char)) !== -1) return crow2[index+1];
    else if ((index = crow3.indexOf(char)) !== -1) return crow3[index+1];
    else if ((index = crowNum.indexOf(char)) !== -1) return crowNum[index+1];

    return char;
}

function getDecryptedChar(char) {
    if (char == ' ') return char;
    else if (char == '`') return '=';
    else if (char == 'q') return '\\';
    else if (char == 'a') return '\'';
    else if (char == 'z') return '/';
    else if (char == '~') return '+';
    else if (char == 'Q') return '|';
    else if (char == 'A') return '"';
    else if (char == 'Z') return '?';

    var index;
    if ((index = row1.indexOf(char)) !== -1) return row1[index-1];
    else if ((index = row2.indexOf(char)) !== -1) return row2[index-1];
    else if ((index = row3.indexOf(char)) !== -1) return row3[index-1];
    else if ((index = rowNum.indexOf(char)) !== -1) return rowNum[index-1];
    else if ((index = crow1.indexOf(char)) !== -1) return crow1[index-1];
    else if ((index = crow2.indexOf(char)) !== -1) return crow2[index-1];
    else if ((index = crow3.indexOf(char)) !== -1) return crow3[index-1];
    else if ((index = crowNum.indexOf(char)) !== -1) return crowNum[index-1];

    return char;
}
