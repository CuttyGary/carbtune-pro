(function(root){
'use strict';

/*
 * CarbTune component knowledge seed.
 *
 * This file is deliberately data-only. Application behavior lives in index.html.
 * Records may be updated independently as evidence is reviewed. Unknown fields
 * remain null; they must never be filled with guessed specifications.
 */
root.CARB_TUNE_KNOWLEDGE={
 schemaVersion:1,
 released:'2026-08-27',
 evidenceTypes:[
  'MANUFACTURER_VERIFIED_FACT',
  'AUTHORITATIVE_TECHNICAL_FACT',
  'CARBTUNE_CALCULATION',
  'CARBTUNE_INFERENCE',
  'REAL_WORLD_OBSERVATION',
  'UNVERIFIED_INFORMATION'
 ],
 verificationStatuses:['VERIFIED','PARTIALLY_VERIFIED','UNVERIFIED','CONFLICTED','RETIRED'],
 compatibilityClasses:['DIRECT_FIT','FITS_WITH_MODIFICATION','CONDITIONAL','INCOMPATIBLE','UNVERIFIED'],
 suitabilityClasses:['EXCELLENT_MATCH','GOOD_MATCH','MARGINAL','UNDERSIZED','OVERSIZED_FOR_INTENDED_USE','INAPPROPRIATE','UNKNOWN'],
 categories:[
  'cylinder-head','camshaft','valvetrain','intake-manifold','carburetor','ignition',
  'fuel-delivery','exhaust','transmission','torque-converter','rear-gear','other'
 ],
 componentRecordSchema:{
  id:'stable namespaced identifier',
  manufacturer:'string or null',
  productFamily:'string or null',
  model:'string or null',
  partNumber:'string or null',
  alternatePartNumbers:'string[]',
  category:'category id',
  fitment:'relationship dimensions; never only vehicle year/make/model',
  technicalSpecifications:'provenance-bearing fact objects',
  tuningCharacteristics:'provenance-bearing fact or inference objects',
  requiredSupportingComponents:'relationship ids',
  knownIncompatibilities:'relationship rules',
  lifecycleStatus:'ACTIVE, DISCONTINUED, SUPERSEDED, UNKNOWN',
  evidence:'source records',
  verificationStatus:'verification status',
  interpretationMetadata:'CarbTune-owned interpretation inputs'
 },
 components:[
  {
   id:'carburetor:holley:0-1850c',
   manufacturer:'Holley',productFamily:'Model 4160',model:'Street 600 CFM Vacuum Secondary',partNumber:'0-1850C',alternatePartNumbers:['1850C'],
   category:'carburetor',fitment:{engineFamilies:[],carburetorFlanges:['4150 square bore'],notes:'Universal four-barrel application; final suitability depends on the complete engine and intended use.'},
   technicalSpecifications:{airflowCfm:600,secondaryType:'Vacuum',chokeType:'Manual',flange:'4150 square bore'},
   tuningCharacteristics:{notes:'Manufacturer-identified 600 CFM Model 4160 street carburetor. CarbTune does not infer final calibration from this record.'},
   requiredSupportingComponents:['intake-manifold:4150-square-bore'],knownIncompatibilities:[],lifecycleStatus:'ACTIVE',
   evidence:[{type:'MANUFACTURER_VERIFIED_FACT',source:'https://www.holley.com/products/fuel_systems/carburetors/street/parts/0-1850C',label:'Holley product page',date:'2026-08-27'}],
   verificationStatus:'VERIFIED',interpretationMetadata:{airflowCfm:600,boosterType:null,secondaryType:'Vacuum',intendedUse:['Street'],notes:'Compatibility is flange-based; application suitability remains a separate CarbTune assessment.'}
  },
  {
   id:'carburetor:holley:0-3310s',
   manufacturer:'Holley',productFamily:'Model 4160',model:'Street 750 CFM Vacuum Secondary',partNumber:'0-3310S',alternatePartNumbers:['3310S'],
   category:'carburetor',fitment:{engineFamilies:[],carburetorFlanges:['4150 square bore'],notes:'Universal four-barrel application; final suitability depends on the complete engine and intended use.'},
   technicalSpecifications:{airflowCfm:750,secondaryType:'Vacuum',chokeType:'Manual',flange:'4150 square bore'},
   tuningCharacteristics:{notes:'Manufacturer-identified 750 CFM Model 4160 street carburetor. CarbTune does not infer final calibration from this record.'},
   requiredSupportingComponents:['intake-manifold:4150-square-bore'],knownIncompatibilities:[],lifecycleStatus:'ACTIVE',
   evidence:[{type:'MANUFACTURER_VERIFIED_FACT',source:'https://www.holley.com/products/fuel_systems/carburetors/street/parts/0-3310S',label:'Holley product page',date:'2026-08-27'}],
   verificationStatus:'VERIFIED',interpretationMetadata:{airflowCfm:750,boosterType:null,secondaryType:'Vacuum',intendedUse:['Street','Street performance'],notes:'Compatibility is flange-based; application suitability remains a separate CarbTune assessment.'}
  },
  {
   id:'carburetor:brawler:br-67255:unverified-seed',
   manufacturer:'Brawler',productFamily:null,model:'BR-67255',partNumber:'BR-67255',alternatePartNumbers:[],
   category:'carburetor',fitment:{engineFamilies:[],chassis:[],dimensions:[],notes:null},
   technicalSpecifications:{},tuningCharacteristics:{},requiredSupportingComponents:[],knownIncompatibilities:[],
   lifecycleStatus:'UNKNOWN',evidence:[],verificationStatus:'UNVERIFIED',
   interpretationMetadata:{airflowCfm:null,boosterType:null,secondaryType:null,intendedUse:[],notes:'Demo identification only; specifications require evidence.'}
  }
 ]
};
})(window);
