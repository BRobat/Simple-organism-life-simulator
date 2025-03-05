varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uDayColor;
uniform vec3 uNightColor;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(vUv, 1.0);

    // Day / night color
    vec3 dayColor = uDayColor;
    vec3 nightColor = uNightColor;

    // Sun orientation
    float sunOrientation = dot(uSunDirection, normal);
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);

   vec3 reflection = reflect(- uSunDirection, normal);
    float specular = - dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);


    color = mix(nightColor, dayColor, dayMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);
    color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}