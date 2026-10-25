import bpy
import os
import math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_ring(name, major_radius, minor_radius, segments_major=48, segments_minor=16):
    bpy.ops.mesh.primitive_torus_add(
        align='WORLD',
        location=(0, 0, 0),
        rotation=(0, 0, 0),
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=segments_major,
        minor_segments=segments_minor
    )
    obj = bpy.context.active_object
    obj.name = name
    
    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    # Generate UVs
    bpy.ops.object.editmode_toggle()
    bpy.ops.uv.smart_project()
    bpy.ops.object.editmode_toggle()
    
    # Apply all transforms and ensure pivot is at origin
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.location = (0, 0, 0)
    return obj

def create_core(name="Core", radius=0.65, subdivisions=2):
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=subdivisions,
        radius=radius,
        location=(0, 0, 0)
    )
    obj = bpy.context.active_object
    obj.name = name
    
    for poly in obj.data.polygons:
        poly.use_smooth = True
        
    bpy.ops.object.editmode_toggle()
    bpy.ops.uv.smart_project()
    bpy.ops.object.editmode_toggle()
    
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.location = (0, 0, 0)
    return obj

def main():
    clean_scene()
    
    # Create 3 concentric beveled rings
    ring_outer = create_ring("Ring_Outer", major_radius=2.4, minor_radius=0.08, segments_major=64, segments_minor=20)
    ring_mid = create_ring("Ring_Mid", major_radius=1.8, minor_radius=0.07, segments_major=48, segments_minor=16)
    ring_inner = create_ring("Ring_Inner", major_radius=1.2, minor_radius=0.06, segments_major=48, segments_minor=16)
    
    # Create central optical core icosphere
    core = create_core("Core", radius=0.65, subdivisions=3)
    
    # Ensure export directory exists
    output_dir = os.path.abspath("public/models")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "gyroscope.glb")
    
    # Export GLB (Y-up, apply modifiers, web friendly)
    bpy.ops.export_scene.gltf(
        filepath=output_file,
        export_format='GLB',
        export_yup=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True
    )
    print(f"SUCCESS: Exported gyroscope GLB to {output_file}")

if __name__ == "__main__":
    main()
