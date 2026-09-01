(function(root){
'use strict';

/*
 * Unified relational vehicle/chassis query layer.
 *
 * DOE/EPA FuelEconomy.gov remains the preferred 1984+ source because its
 * records often preserve a source-provided submodel. Official NHTSA ODI
 * vehicle-recall applications fill the pre-1984 coverage gap. Exact sourced
 * supplements remain separate, attributable records. No global model or trim
 * vocabulary is used.
 */
const CURRENT=root.CARB_TUNE_VEHICLE_APPLICATIONS||{source:{},coverage:{},applications:[]};
const HISTORICAL=root.CARB_TUNE_HISTORICAL_VEHICLE_APPLICATIONS||{source:{},coverage:{},applications:[]};
const UNKNOWN='Unknown / Not Listed';
const CUSTOM='Other / Custom';
const ESCAPE_OPTIONS=[UNKNOWN,CUSTOM];

const SUPPLEMENTS=[
 {year:1982,make:'Oldsmobile',model:'Cutlass Supreme',submodel:null,trim:null,source:'NHTSA vPIC year/make/model API',verificationStatus:'VERIFIED_SOURCE_RECORD',provenance:{
  type:'AUTHORITATIVE_YEAR_MAKE_MODEL',
  url:'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/Oldsmobile/modelyear/1982?format=json'
 }},
 {year:1982,make:'Oldsmobile',model:'Cutlass Ciera',submodel:null,trim:null,source:'NHTSA vPIC year/make/model API',verificationStatus:'VERIFIED_SOURCE_RECORD',provenance:{
  type:'AUTHORITATIVE_YEAR_MAKE_MODEL',
  url:'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/Oldsmobile/modelyear/1982?format=json'
 }},
 ...['Base','S/E','Trans Am'].map(submodel=>({year:1982,make:'Pontiac',model:'Firebird',submodel,trim:null,source:'1982 Pontiac Firebird sales brochure',verificationStatus:'VERIFIED_SOURCE_RECORD',provenance:{
  type:'PERIOD_MANUFACTURER_BROCHURE',
  url:'https://autocatalogarchive.com/wp-content/uploads/2025/04/Pontiac-Firebird-1982-USA.pdf'
 }})),
 ...['Base','Trans Am'].map(submodel=>({year:2002,make:'Pontiac',model:'Firebird',submodel,trim:null,source:'2002 Pontiac Firebird / Trans Am sales brochure',verificationStatus:'VERIFIED_SOURCE_RECORD',provenance:{
  type:'PERIOD_MANUFACTURER_BROCHURE',
  url:'https://xr793.com/wp-content/uploads/2017/02/2002-Pontiac-Firebird-Trans-Am-Full.pdf'
 }}))
];

const canonical=value=>String(value??'')
 .normalize('NFKD')
 .replace(/[\u0300-\u036f]/g,'')
 .toUpperCase()
 .replace(/[^A-Z0-9]+/g,' ')
 .trim()
 .replace(/\s+/g,' ');
const isEscape=value=>ESCAPE_OPTIONS.some(option=>canonical(option)===canonical(value));
const ACRONYMS=new Set(['AM','BMW','EV','FIAT','GMC','GT','HD','HR','LE','MINI','PHEV','RAM','SE','SD','SRT','SS','SUV','XL']);
const displayToken=token=>/\d/.test(token)||/[-/]/.test(token)||ACRONYMS.has(token)?token:token.charAt(0)+token.slice(1).toLowerCase();
const displayName=value=>{
 const text=String(value??'').trim().replace(/\s+/g,' ');
 return text&&text===text.toUpperCase()?text.split(' ').map(displayToken).join(' '):text;
};
const rowKey=row=>[row.year,row.make,row.model,row.submodel,row.trim].map(canonical).join('|');
const rows=[];
const seen=new Set();
const addRow=row=>{
 const normalized={...row,year:Number(row.year),make:displayName(row.make),model:displayName(row.model),submodel:row.submodel?displayName(row.submodel):null,trim:row.trim?displayName(row.trim):null};
 const key=rowKey(normalized);
 if(!normalized.year||!normalized.make||!normalized.model||seen.has(key))return;
 seen.add(key);
 rows.push(normalized);
};
CURRENT.applications.forEach(addRow);
HISTORICAL.applications.forEach(addRow);
SUPPLEMENTS.forEach(addRow);

const matches=(left,right)=>canonical(left)===canonical(right);
const records=selection=>{
 const selected=selection||{};
 if(Object.values(selected).some(isEscape))return[];
 return rows.filter(row=>(selected.year==null||String(row.year)===String(selected.year))&&
  (selected.make==null||matches(row.make,selected.make))&&
  (selected.model==null||matches(row.model,selected.model)));
};
const unique=(values,format=value=>value)=>{
 const byKey=new Map();
 values.filter(value=>value!=null&&String(value).trim()).forEach(value=>{
  const key=canonical(value);
  if(key&&!byKey.has(key))byKey.set(key,format(value));
 });
 return [...byKey.values()].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:'base'}));
};
const values=(field,selection={})=>{
 const found=records(selection).flatMap(row=>field==='submodelTrim'?[row.submodel,row.trim]:[row[field]]);
 return unique(found,field==='year'?value=>Number(value):displayName);
};
const options=(field,selection={})=>[...values(field,selection),...ESCAPE_OPTIONS];

const sourceMakes=new Set(rows.map(row=>canonical(row.make)));
const sourceModels=new Set(rows.map(row=>`${canonical(row.make)}|${canonical(row.model)}`));
const sourceYears=unique(rows.map(row=>row.year),Number);
const rowsWithVariant=rows.filter(row=>row.submodel||row.trim).length;

root.CARB_TUNE_VEHICLES={
 schemaVersion:2,
 scope:'MULTI_SOURCE_RELATIONAL_APPLICATIONS',
 comprehensive:false,
 applications:rows,
 escapeOptions:[...ESCAPE_OPTIONS],
 unknownOption:UNKNOWN,
 customOption:CUSTOM,
 sources:[CURRENT.source,HISTORICAL.source],
 coverage:{
  applicationRecordCount:rows.length,
  minimumYear:Math.min(...sourceYears),
  maximumYear:Math.max(...sourceYears),
  yearCount:sourceYears.length,
  makeCount:sourceMakes.size,
  modelCount:sourceModels.size,
  recordsWithSubmodelOrTrim:rowsWithVariant,
  submodelOrTrimPercentage:Number((100*rowsWithVariant/rows.length).toFixed(2)),
  supplementalRecordCount:SUPPLEMENTS.length
 },
 limitation:'The merged registry is broad but not comprehensive. NHTSA recall applications do not supply trim data, and absence from either source does not prove a vehicle was never produced.',
 records,
 values,
 options,
 sameValue:matches,
 isEscape
};
})(window);
