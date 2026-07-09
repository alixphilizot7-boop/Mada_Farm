import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 700, color: "#047857" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  table: { marginTop: 20, borderTop: "1 solid #ccc" },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #eee", paddingVertical: 6 },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #333",
    paddingVertical: 6,
    fontWeight: 700,
  },
  col1: { width: "15%" },
  col2: { width: "40%" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "15%", textAlign: "right" },
  col5: { width: "15%", textAlign: "right" },
  totals: { marginTop: 20, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 2 },
});

const PRODUCT_LABELS: Record<string, string> = {
  EGGS: "Œufs",
  CHICKS: "Poussins",
  CHICKEN: "Poulets",
  OTHER: "Autre",
};

type InvoicePdfProps = {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  items: { productType: string; description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  formatMoney: (n: number) => string;
};

export function InvoicePdf({
  invoiceNumber,
  issueDate,
  dueDate,
  customerName,
  customerAddress,
  customerPhone,
  items,
  subtotal,
  tax,
  total,
  notes,
  formatMoney,
}: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Mada Farm</Text>
          <Text>Facture {invoiceNumber}</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text>Facturé à :</Text>
            <Text>{customerName}</Text>
            {customerAddress && <Text>{customerAddress}</Text>}
            {customerPhone && <Text>{customerPhone}</Text>}
          </View>
          <View>
            <Text>Date d&apos;émission : {issueDate}</Text>
            {dueDate && <Text>Date d&apos;échéance : {dueDate}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Produit</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>Qté</Text>
            <Text style={styles.col4}>Prix unitaire</Text>
            <Text style={styles.col5}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.col1}>{PRODUCT_LABELS[item.productType] ?? item.productType}</Text>
              <Text style={styles.col2}>{item.description}</Text>
              <Text style={styles.col3}>{item.quantity}</Text>
              <Text style={styles.col4}>{formatMoney(item.unitPrice)}</Text>
              <Text style={styles.col5}>{formatMoney(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Sous-total</Text>
            <Text>{formatMoney(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA</Text>
            <Text>{formatMoney(tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: 700 }}>Total</Text>
            <Text style={{ fontWeight: 700 }}>{formatMoney(total)}</Text>
          </View>
        </View>

        {notes && (
          <View style={{ marginTop: 30 }}>
            <Text>Remarques : {notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
