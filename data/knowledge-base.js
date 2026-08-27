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
