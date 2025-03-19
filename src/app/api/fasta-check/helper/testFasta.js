// Author: Naveen Duhan

// test fasta file
export function testFasta(fastaText) {
    let checkPass = true;
    let protSeq = false;
    let nuclSeq = false;
    let numberSeq = 0;
  
    const sequences = fastaText.split('\n');
  
    if (sequences.length > 1) {
      const nucleotideRegex = /^[ATGCN]*$/;
      const aminoacidRegex = /^[ILVFMCAGPTSYWQNHEDKRXUBZ]+[\*]*$/;
  
      const firstLine = sequences[0].trim();
  
      if (firstLine.startsWith('>')) {
        numberSeq++;
  
        if (nucleotideRegex.test(sequences[1].trim())) {
          nuclSeq = true;
        } else if (aminoacidRegex.test(sequences[1].trim())) {
          protSeq = true;
        } else {
          checkPass = false;
        }
  
        if (checkPass) {
          let sequencestatus = 1;
  
          for (let i = 1; i < sequences.length; i++) {
            const fastaLine = sequences[i].trim();
  
            if (fastaLine.length === 0 && sequencestatus === 0) {
              sequencestatus = 0;
            } else if (fastaLine.startsWith('>') && sequencestatus !== 1) {
              sequencestatus = 1;
              numberSeq++;
            } else if (
              ((nuclSeq && nucleotideRegex.test(fastaLine)) ||
               (protSeq && aminoacidRegex.test(fastaLine))) &&
              sequencestatus > 0
            ) {
              sequencestatus = 2;
            } else if (fastaLine.length === 0 && sequencestatus > 1) {
              sequencestatus = 0;
            } else {
              checkPass = false;
              break;
            }
          }
        }
      } else {
        checkPass = false;
      }
    }
  
    return { checkPass, numberSeq };
  }