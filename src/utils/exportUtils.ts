import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Batch } from '../types';
import { format } from 'date-fns';

export function exportToExcel(batch: Batch) {
  const wb = XLSX.utils.book_new();
  
  // Summary data
  const summaryData = [
    ['Batch Name', batch.name],
    ['Start Date', format(new Date(batch.startDate), 'MMM d, yyyy')],
    ['End Date', format(new Date(batch.endDate), 'MMM d, yyyy')],
    ['Opening Balance', `₹${batch.openingBalance.toLocaleString()}`],
    ['Total Expenses', `₹${batch.totalExpense.toLocaleString()}`],
    ['Closing Balance', `₹${batch.closingBalance.toLocaleString()}`],
    [],
  ];

  // Transaction data
  const transactionHeaders = ['Date', 'Particulars', 'Amount', 'Place', 'Remarks'];
  const transactionData = batch.transactions.map(t => [
    format(new Date(t.date), 'MMM d, yyyy'),
    t.particulars,
    `₹${t.amount.toLocaleString()}`,
    t.place,
    t.remarks,
  ]);

  const allData = [...summaryData, transactionHeaders, ...transactionData];
  
  const ws = XLSX.utils.aoa_to_sheet(allData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Batch Report');
  XLSX.writeFile(wb, `${batch.name}_report.xlsx`);
}

export function exportToPDF(batch: Batch) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Expense Batch Report', 20, 30);
  
  // Batch info
  doc.setFontSize(12);
  doc.text(`Batch Name: ${batch.name}`, 20, 50);
  doc.text(`Period: ${format(new Date(batch.startDate), 'MMM d, yyyy')} - ${format(new Date(batch.endDate), 'MMM d, yyyy')}`, 20, 60);
  
  // Summary table
  autoTable(doc, {
    startY: 80,
    head: [['Summary', 'Amount']],
    body: [
      ['Opening Balance', `₹${batch.openingBalance.toLocaleString()}`],
      ['Total Expenses', `₹${batch.totalExpense.toLocaleString()}`],
      ['Closing Balance', `₹${batch.closingBalance.toLocaleString()}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });
  
  // Transactions table
  if (batch.transactions.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Particulars', 'Amount', 'Place', 'Remarks']],
      body: batch.transactions.map(t => [
        format(new Date(t.date), 'MMM d, yyyy'),
        t.particulars,
        `₹${t.amount.toLocaleString()}`,
        t.place,
        t.remarks || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
      },
    });
  }
  
  doc.save(`${batch.name}_report.pdf`);
}