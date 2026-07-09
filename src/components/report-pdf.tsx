import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 700, color: "#047857" },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 20, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1 solid #eee" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTop: "1 solid #333", marginTop: 4, fontWeight: 700 },
});

type ReportPdfProps = {
  periodLabel: string;
  incomeByCategory: { category: string; amount: number }[];
  expenseByCategory: { category: string; amount: number }[];
  totalIncome: number;
  totalExpense: number;
  net: number;
  marginPct: number;
  formatMoney: (n: number) => string;
};

export function ReportPdf({
  periodLabel,
  incomeByCategory,
  expenseByCategory,
  totalIncome,
  totalExpense,
  net,
  marginPct,
  formatMoney,
}: ReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Mada Farm</Text>
          <Text>Income Statement — {periodLabel}</Text>
        </View>

        <Text style={styles.sectionTitle}>Revenue</Text>
        {incomeByCategory.map((l) => (
          <View style={styles.row} key={l.category}>
            <Text>{l.category}</Text>
            <Text>{formatMoney(l.amount)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text>Total revenue</Text>
          <Text>{formatMoney(totalIncome)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Costs</Text>
        {expenseByCategory.map((l) => (
          <View style={styles.row} key={l.category}>
            <Text>{l.category}</Text>
            <Text>{formatMoney(l.amount)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text>Total costs</Text>
          <Text>{formatMoney(totalExpense)}</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={styles.totalRow}>
            <Text>Net result</Text>
            <Text>{formatMoney(net)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Net margin</Text>
            <Text>{marginPct.toFixed(1)}%</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
