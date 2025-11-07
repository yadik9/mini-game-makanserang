let siswa = ['Andi', 'Susanto', 'Sandi'];

console.log(`Jumlah list : ${siswa.lenght}`)

siswa.forEach(function(nama){
    let JumlahHuruf = nama.length;
    console.log(`${nama} = ${JumlahHuruf} huruf`)
});