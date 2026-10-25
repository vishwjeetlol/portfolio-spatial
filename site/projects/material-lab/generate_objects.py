import bpy
import os
import math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def export_glb(obj, filepath):
    # Select only this object
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True
    )
    print(f"Exported: {filepath}")

def build_twisted_torus_knot(out_path):
    clean_scene()
    # Build Torus Knot using mesh curve or torus with twist
    bpy.ops.mesh.primitive_torus_add(
        align='WORLD', location=(0, 0, 0),
        major_radius=1.8, minor_radius=0.45,
        major_segments=64, minor_segments=24
    )
    obj = bpy.context.active_object
    obj.name = "TwistedTorusKnot"
    
    # Add simple twist deform modifier
    mod = obj.modifiers.new(name="Twist", type='SIMPLE_DEFORM')
    mod.deform_method = 'TWIST'
    mod.angle = math.radians(120)
    
    # Smooth shading & UVs
    for p in obj.data.polygons:
        p.use_smooth = True
    bpy.ops.object.editmode_toggle()
    bpy.ops.uv.smart_project()
    bpy.ops.object.editmode_toggle()
    
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    export_glb(obj, out_path)

def build_faceted_shard(out_path):
    clean_scene()
    # Polyhedral crystalline shard with sharp geometric facets
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.6, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = "FacetedShard"
    
    # Elongate along Z axis
    obj.scale = (0.9, 0.9, 1.8)
    bpy.ops.object.transform_apply(scale=True)
    
    # Add Bevel modifier for sharp mineral edges
    bev = obj.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.08
    bev.segments = 1
    
    # Flat faceted shading for crystalline refraction
    for p in obj.data.polygons:
        p.use_smooth = False
    bpy.ops.object.editmode_toggle()
    bpy.ops.uv.smart_project()
    bpy.ops.object.editmode_toggle()
    
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    export_glb(obj, out_path)

def build_ribbed_vase(out_path):
    clean_scene()
    # Fluted cylindrical vase with radial sinusoidal displacement
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=48, radius=1.2, depth=3.0,
        end_fill_type='NOTHING', location=(0, 0, 0)
    )
    obj = bpy.context.active_object
    obj.name = "RibbedVase"
    
    # Apply wave or shape deformation to vertices for fluted ribs
    mesh = obj.data
    for v in mesh.vertices:
        angle = math.atan2(v.co.y, v.co.x)
        r_mod = 1.0 + 0.15 * math.cos(angle * 12)
        # vase waist taper
        z_factor = 1.0 - 0.3 * math.sin((v.co.z + 1.5) / 3.0 * math.pi)
        v.co.x *= r_mod * z_factor
        v.co.y *= r_mod * z_factor
        
    for p in obj.data.polygons:
        p.use_smooth = True
        
    bpy.ops.object.editmode_toggle()
    bpy.ops.uv.smart_project()
    bpy.ops.object.editmode_toggle()
    
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    export_glb(obj, out_path)

def main():
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    build_twisted_torus_knot(os.path.join(models_dir, "twisted_torus_knot.glb"))
    build_faceted_shard(os.path.join(models_dir, "faceted_shard.glb"))
    build_ribbed_vase(os.path.join(models_dir, "ribbed_vase.glb"))

if __name__ == "__main__":
    main()
