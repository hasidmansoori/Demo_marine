import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 40 },
  headerImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: 180 },
  title: { textAlign: 'center', fontSize: 14, marginTop: 190, fontWeight: 'bold' },
  intro: { fontSize: 10, marginTop: 6 },
  details: { marginTop: 6, fontSize: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 2 },
  leftCol: { width: '60%' },
  rightCol: { width: '40%' },
  obsTitle: { marginTop: 8, fontSize: 11, fontWeight: 'bold' },
  obsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, fontSize: 10 },
  remark: { marginTop: 6, fontSize: 10 },
  footerBlock: { marginTop: 8, fontSize: 10 },
  signature: { width: 180, height: 90, marginTop: 12, marginLeft: 'auto' },
  imageGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridImage: { width: 140, height: 100, marginBottom: 8 }
});

// PDFDocument receives data (form values), letterhead and signature as URLs/dataURLs, and optional imagePaths array
export default function PDFDocument({ data, letterhead, signature, images = [] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* letterhead as fixed background on every page */}
        <Image src={letterhead} style={styles.headerImage} fixed />
        <Text style={styles.title}>EMPTY CONTAINER SURVEY REPORT</Text>
        <Text style={styles.intro}>THIS IS TO CERTIFY, WE THE UNDERSIGNED MARINE SURVEYORS DID AT THE REQUEST OF</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.leftCol}><Text style={{fontWeight:'bold'}}>CONTAINER NO.</Text> {data.container_no}</Text>
            <Text style={styles.rightCol}><Text style={{fontWeight:'bold'}}>SET TEMP/HUMIDITY</Text> {data.set_temp}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.leftCol}><Text style={{fontWeight:'bold'}}>BKG NO, M/LINE</Text> {data.bkg_no}</Text>
            <Text style={styles.rightCol}><Text style={{fontWeight:'bold'}}>MFG DATE</Text> {data.mfg_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.leftCol}><Text style={{fontWeight:'bold'}}>SURVEY DATE</Text> {data.survey_date}</Text>
          </View>
        </View>

        <Text style={styles.obsTitle}>SURVEY OBSERVATION :-</Text>
        <View>
          {data.observations.map((o, idx) => (
            <View style={styles.obsRow} key={idx}>
              <Text>{idx+1}. {o.label}</Text>
              <Text style={{fontWeight:'bold'}}>{o.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.remark}><Text style={{fontWeight:'bold'}}>REMARK:-</Text> {data.remarks}</Text>

        <View style={styles.footerBlock}>
          <Text><Text style={{fontWeight:'bold'}}>Shipper:</Text> {data.shipper}</Text>
          <Text><Text style={{fontWeight:'bold'}}>A/C:</Text> {data.ac}</Text>
          <Text>Issued Without Prejudice</Text>
          <Text style={{fontWeight:'bold'}}>{data.issued_for}</Text>
        </View>

        {/* signature at end (will appear on last page) */}
        {signature && <Image src={signature} style={styles.signature} />}

        {/* images grid below signature — react-pdf will paginate if needed */}
        {images && images.length>0 && (
          <View style={styles.imageGrid}>
            {images.map((src, i) => <Image key={i} src={src} style={styles.gridImage} />)}
          </View>
        )}
      </Page>
    </Document>
  );
}
