# Material Lab: Procedural 3D Shader & Physical Optics Studio

An interactive 3D material inspection environment running Three.js `MeshPhysicalMaterial` shaders on custom procedural geometries generated headlessly with Blender.

## What It Is
A tactile material laboratory for tuning optical transmission, surface micro-roughness, metallic conductance, and index of refraction (IOR) in real time. Visitors can switch between three procedurally engineered 3D forms, orbit them with inertial physics, and toggle an under-the-hood wireframe viewport.

## How It Works
1. **Headless Blender Generation (`generate_objects.py`):**
   - Headless script runs via `/Applications/Blender.app` using `bpy`.
   - Generates 3 distinct models with UV projection and transforms applied at origin:
     - `twisted_torus_knot.glb`: Continuous non-orientable topological knot.
     - `faceted_shard.glb`: Beveled mineral crystal with sharp planar facets.
     - `ribbed_vase.glb`: Sinusoidally fluted ceramic/glass vessel.
   - All models pass glTF 2.0 binary header validation (`676c5446`), zero `gltf-validator` errors, and sha256 checksum tracking in `MANIFEST.sha256`.
2. **Physical Shading & Optics:**
   - Real-time PBR pipeline using Three.js `MeshPhysicalMaterial`.
   - Dynamic parameters: Transmission ($0.0 \to 1.0$), IOR ($1.0 \to 2.4$), Roughness ($0.0 \to 1.0$), and Metalness ($0.0 \to 1.0$).
   - Multi-point studio lighting with chromatic rim highlights.
   - Under-the-hood topological wireframe inspection.

## How To Run
1. Run `generate_objects.py` in Blender headless mode to rebuild models.
2. Open `index.html` in any modern web browser or serve with `npx serve`.
