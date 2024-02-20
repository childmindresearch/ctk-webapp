import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin"

export const cmiLight: CustomThemeConfig = {
  name: "cmi-light",
  properties: {
    // =~= Theme Properties =~=
    "--theme-font-family-base": `system-ui`,
    "--theme-font-family-heading": `system-ui`,
    "--theme-font-color-base": "var(--color-tertiary-700)",
    "--theme-font-color-dark": "255 255 255",
    "--theme-rounded-base": "8px",
    "--theme-rounded-container": "4px",
    "--theme-border-base": "1px",
    // =~= Theme On-X Colors =~=
    "--on-primary": "255 255 255",
    "--on-secondary": "var(--color-tertiary-700)",
    "--on-tertiary": "255 255 255",
    "--on-success": "255 255 255",
    "--on-warning": "var(--color-tertiary-700)",
    "--on-error": "255 255 255",
    "--on-surface": "var(--color-tertiary-700)",
    // =~= Theme Colors  =~=
    // primary | #0067a0
    "--color-primary-50": "217 232 241", // #d9e8f1
    "--color-primary-100": "204 225 236", // #cce1ec
    "--color-primary-200": "191 217 231", // #bfd9e7
    "--color-primary-300": "153 194 217", // #99c2d9
    "--color-primary-400": "77 149 189", // #4d95bd
    "--color-primary-500": "0 103 160", // #0067a0
    "--color-primary-600": "0 93 144", // #005d90
    "--color-primary-700": "0 77 120", // #004d78
    "--color-primary-800": "0 62 96", // #003e60
    "--color-primary-900": "0 50 78", // #00324e
    // secondary | #00c1d4
    "--color-secondary-50": "217 246 249", // #d9f6f9
    "--color-secondary-100": "204 243 246", // #ccf3f6
    "--color-secondary-200": "191 240 244", // #bff0f4
    "--color-secondary-300": "153 230 238", // #99e6ee
    "--color-secondary-400": "77 212 225", // #4dd4e1
    "--color-secondary-500": "0 193 212", // #00c1d4
    "--color-secondary-600": "0 174 191", // #00aebf
    "--color-secondary-700": "0 145 159", // #00919f
    "--color-secondary-800": "0 116 127", // #00747f
    "--color-secondary-900": "0 95 104", // #005f68
    // tertiary | #002b59
    "--color-tertiary-50": "217 223 230", // #d9dfe6
    "--color-tertiary-100": "204 213 222", // #ccd5de
    "--color-tertiary-200": "191 202 214", // #bfcad6
    "--color-tertiary-300": "153 170 189", // #99aabd
    "--color-tertiary-400": "77 107 139", // #4d6b8b
    "--color-tertiary-500": "0 43 89", // #002b59
    "--color-tertiary-600": "0 39 80", // #002750
    "--color-tertiary-700": "0 32 67", // #002043
    "--color-tertiary-800": "0 26 53", // #001a35
    "--color-tertiary-900": "0 21 44", // #00152c
    // success | #098733
    "--color-success-50": "218 237 224", // #daede0
    "--color-success-100": "206 231 214", // #cee7d6
    "--color-success-200": "194 225 204", // #c2e1cc
    "--color-success-300": "157 207 173", // #9dcfad
    "--color-success-400": "83 171 112", // #53ab70
    "--color-success-500": "9 135 51", // #098733
    "--color-success-600": "8 122 46", // #087a2e
    "--color-success-700": "7 101 38", // #076526
    "--color-success-800": "5 81 31", // #05511f
    "--color-success-900": "4 66 25", // #044219
    // warning | #ffca0f
    "--color-warning-50": "255 247 219", // #fff7db
    "--color-warning-100": "255 244 207", // #fff4cf
    "--color-warning-200": "255 242 195", // #fff2c3
    "--color-warning-300": "255 234 159", // #ffea9f
    "--color-warning-400": "255 218 87", // #ffda57
    "--color-warning-500": "255 202 15", // #ffca0f
    "--color-warning-600": "230 182 14", // #e6b60e
    "--color-warning-700": "191 152 11", // #bf980b
    "--color-warning-800": "153 121 9", // #997909
    "--color-warning-900": "125 99 7", // #7d6307
    // error | #da0303
    "--color-error-50": "249 217 217", // #f9d9d9
    "--color-error-100": "248 205 205", // #f8cdcd
    "--color-error-200": "246 192 192", // #f6c0c0
    "--color-error-300": "240 154 154", // #f09a9a
    "--color-error-400": "229 79 79", // #e54f4f
    "--color-error-500": "218 3 3", // #da0303
    "--color-error-600": "196 3 3", // #c40303
    "--color-error-700": "164 2 2", // #a40202
    "--color-error-800": "131 2 2", // #830202
    "--color-error-900": "107 1 1", // #6b0101
    // surface | #faf9f5
    "--color-surface-50": "254 254 254", // #fefefe
    "--color-surface-100": "254 254 253", // #fefefd
    "--color-surface-200": "254 254 253", // #fefefd
    "--color-surface-300": "253 253 251", // #fdfdfb
    "--color-surface-400": "252 251 248", // #fcfbf8
    "--color-surface-500": "250 249 245", // #faf9f5
    "--color-surface-600": "225 224 221", // #e1e0dd
    "--color-surface-700": "188 187 184", // #bcbbb8
    "--color-surface-800": "150 149 147", // #969593
    "--color-surface-900": "123 122 120" // #7b7a78
  }
}
