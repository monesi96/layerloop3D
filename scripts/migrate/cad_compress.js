const fs=require('fs');
const {NodeIO}=require('@gltf-transform/core');
const {weld,simplify,quantize,dedup,prune,meshopt,reorder}=require('@gltf-transform/functions');
const {KHRMeshQuantization}=require('@gltf-transform/extensions');
const {MeshoptEncoder,MeshoptSimplifier}=require('meshoptimizer');
(async()=>{
 await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
 const io=new NodeIO().registerExtensions([KHRMeshQuantization]);
 const doc=await io.read(process.argv[2]);
 const ratio=+process.argv[4]||0.35;
 await doc.transform(dedup(),weld({tolerance:1e-5}),simplify({simplifier:MeshoptSimplifier,ratio,error:0.003,lockBorder:false}),prune(),quantize({quantizePosition:16,quantizeNormal:12}));
 await io.write(process.argv[3],doc);
 console.log('GLB',(fs.statSync(process.argv[3]).size/1048576).toFixed(2),'MB');
})().catch(e=>console.log('ERR',e));
