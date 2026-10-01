import ExcelJS from 'exceljs';

const excelPath = "C:\\Users\\Samuel Gc\\Downloads\\Maestro_Liga BetplayII (5).xlsx";

async function leerExcel() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    
    console.log("Hojas disponibles:");
    workbook.eachSheet((sheet, id) => {
        console.log(`- ${sheet.name} (ID: ${id})`);
    });

    const sheetName = workbook.worksheets.find(s => s.name.toLowerCase().includes('partido') || s.name.toLowerCase().includes('fixture'))?.name;
    if (!sheetName) {
        console.error("No se encontró la hoja de partidos.");
        return;
    }
    
    console.log(`\nUsando hoja: ${sheetName}`);
    const sheet = workbook.getWorksheet(sheetName);
    
    const rows: any[] = [];
    sheet?.eachRow((row, rowNumber) => {
        if (rowNumber <= 3) {
            console.log(`Fila ${rowNumber}:`, row.values);
        }
    });
}

leerExcel().catch(console.error);
