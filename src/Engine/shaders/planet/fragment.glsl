

#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

varying vec2 vUv;
// varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uDayColor;
uniform vec3 uNightColor;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

#ifdef IOR
uniform float ior;
#endif
#ifdef USE_SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
    vec4 diffuseColor = vec4(diffuse, opacity);
        // Final color

	#include <clipping_planes_fragment>
    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
    vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
    vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
    vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
    float sheenEnergyComp = 1.0 - 0.157 * max3(material.sheenColor);
    outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
    float dotNVcc = saturate(dot(geometryClearcoatNormal, geometryViewDir));
    vec3 Fcc = F_Schlick(material.clearcoatF0, material.clearcoatF90, dotNVcc);
    outgoingLight = outgoingLight * (1.0 - material.clearcoat * Fcc) + (clearcoatSpecularDirect + clearcoatSpecularIndirect) * material.clearcoat;
	#endif

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>

	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>


    // vec3 viewDirection = normalize(vPosition - cameraPosition);

    // vec3 color = vec3(totalSpecular.xyz);
    // // // Day / night color
    // vec3 dayColor = uDayColor;
    // vec3 nightColor = uNightColor;

    // // // Sun orientation
    // float sunOrientation = dot(uSunDirection, normal);
    // float dayMix = smoothstep(-0.25, 0.5, sunOrientation);

    // // // Fresnel
    // float fresnel = dot(viewDirection, normal) + 1.0;
    // fresnel = pow(fresnel, 2.0);

    // // // Atmosphere
    // float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    // vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);

    // // vec3 reflection = reflect(-uSunDirection, normal);
    // // float specular = -dot(reflection, viewDirection);
    // // specular = max(specular, 0.0);
    // // specular = pow(specular, 32.0);
    // // vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);

    // color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);
    // color = mix(nightColor, dayColor, dayMix);
    // // // color += specular * specularColor;
    // gl_FragColor = vec4(color, 1.0);
    	#include <fog_fragment>
}
