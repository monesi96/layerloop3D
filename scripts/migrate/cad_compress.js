const fs=require('fs');
const {NodeIO}=require('@gltf-transform/core');
const {weld,simplify,quantize,dedup,prune,meshopt,reorder}=require('@gltf-transform/functions');
const {EXTMeshoptCompression,KHRMaterialsUnlit}=require('@gltf-transform/extensions');
const {MeshoptEncoder,MeshoptSimplifier}=require('meshoptimizer');
(async()=>{
 await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
 const io=new NodeIO().registerExtensions([EXTMeshoptCompression]).registerDependencies({'meshopt.encoder':MeshoptEncoder});
 const doc=await io.read(process.argv[2]);
 const ratio=+process.argv[4]||0.35;
 await doc.transform(dedup(),weld({tolerance:1e-5}),simplify({simplifier:MeshoptSimplifier,ratio,error:0.003,lockBorder:false}),prune(),reorder({encoder:MeshoptEncoder}),quantize({quantizePosition:14,quantizeNormal:10}),meshopt({encoder:MeshoptEncoder,level:'high'}));
 await io.write(process.argv[3],doc);
 console.log('GLB',(fs.statSync(process.argv[3]).size/1048576).toFixed(2),'MB');
})().catch(e=>console.log('ERR',e));
