import { IPresetFormula } from "@/types/latex";

export const presetFormula: IPresetFormula[] = [
    {
        title: "代数",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_1.png",
                    import.meta.url
                ).href,
                text: "\\left(x-1\\right)\\left(x+3\\right)"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_2.png",
                    import.meta.url
                ).href,
                text: "\\sqrt{a^2+b^2}"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_3.png",
                    import.meta.url
                ).href,
                text: "\\left ( \\frac{a}{b}\\right )^{n}= \\frac{a^{n}}{b^{n}}"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_4.png",
                    import.meta.url
                ).href,
                text: "\\frac{a}{b}\\pm \\frac{c}{d}= \\frac{ad \\pm bc}{bd}"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_5.png",
                    import.meta.url
                ).href,
                text: "\\frac{x^{2}}{a^{2}}-\\frac{y^{2}}{b^{2}}=1"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_6.png",
                    import.meta.url
                ).href,
                text: "\\frac{1}{\\sqrt{a}}=\\frac{\\sqrt{a}}{a},a\\ge 0\\frac{1}{\\sqrt{a}}=\\frac{\\sqrt{a}}{a},a\\ge 0"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_7.png",
                    import.meta.url
                ).href,
                text: "\\sqrt[n]{a^{n}}=\\left ( \\sqrt[n]{a}\\right )^{n}"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_8.png",
                    import.meta.url
                ).href,
                text: "x ={-b \\pm \\sqrt{b^2-4ac}\\over 2a}"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_9.png",
                    import.meta.url
                ).href,
                text: "y-y_{1}=k \\left( x-x_{1}\\right)"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_10.png",
                    import.meta.url
                ).href,
                text: `\\left\\{\\begin{matrix}
                x=a + r\\text{cos}\\theta \\\\
                y=b + r\\text{sin}\theta
                \\end{matrix}\\right.`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_11.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{l}
                \\text{对于方程形如：}x^{3}-1=0 \\\\
                \\text{设}\\text{:}\\omega =\\frac{-1+\\sqrt{3}i}{2} \\\\
                x_{1}=1,x_{2}= \\omega =\\frac{-1+\\sqrt{3}i}{2} \\\\
                x_{3}= \\omega ^{2}=\\frac{-1-\\sqrt{3}i}{2}
                \\end{array}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_12.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{l}
                    a\\mathop{{x}}\\nolimits^{{2}}+bx+c=0 \\\\
                    \\Delta =\\mathop{{b}}\\nolimits^{{2}}-4ac \\\\
                    \\left\\{\\begin{matrix}
                    \\Delta \\gt 0\\text{方程有两个不相等的实根} \\\\
                    \\Delta = 0\\text{方程有两个不相等的实根} \\\\
                    \\Delta \\lt 0\\text{方程有两个不相等的实根}
                    \\end{matrix}\\right.
                \\end{array}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/algebra/algebra_13.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{l}
                a\\mathop{{x}}\\nolimits^{{2}}+bx+c=0 \\\\
                \\Delta =\\mathop{{b}}\\nolimits^{{2}}-4ac \\\\
                \\mathop{{x}}\\nolimits_{{1,2}}=\\frac{{-b \\pm
                \\sqrt{{\\mathop{{b}}\\nolimits^{{2}}-4ac}}}}{{2a}} \\\\
                \\mathop{{x}}\\nolimits_{{1}}+\\mathop{{x}}\\nolimits_{{2}}=-\\frac{{b}}{{a}} \\\\
                \\mathop{{x}}\\nolimits_{{1}}\\mathop{{x}}\\nolimits_{{2}}=\\frac{{c}}{{a}}
                \\end{array}`
            }
        ]
    },

    {
        title: "几何",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_1.png",
                    import.meta.url
                ).href,
                text: "\\Delta A B C "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_2.png",
                    import.meta.url
                ).href,
                text: "a \\parallel c,b \\parallel c \\Rightarrow a \\parallel b "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_3.png",
                    import.meta.url
                ).href,
                text: "l \\perp \\beta ,l \\subset \\alpha \\Rightarrow \\alpha \\perp \\beta "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_4.png",
                    import.meta.url
                ).href,
                text: `\\left.\\begin{matrix} 
                a \\perp \\alpha \\\\ 
                b \\perp \\alpha 
              \\end{matrix}\\right\\}\\Rightarrow a \\parallel b`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_5.png",
                    import.meta.url
                ).href,
                text: "P \\in \\alpha ,P \\in \\beta , \\alpha \\cap \\beta =l \\Rightarrow P \\in l"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_6.png",
                    import.meta.url
                ).href,
                text: "\\alpha \\perp \\beta , \\alpha \\cap \\beta =l,a \\subset \\alpha ,a \\perp l \\Rightarrow a \\perp \\beta "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_7.png",
                    import.meta.url
                ).href,
                text: `\\left.\\begin{matrix} 
                a \\subset \\beta ,b \\subset \\beta ,a \\cap b=P \\\\  
                a \\parallel \\partial ,b \\parallel \\partial  
              \\end{matrix}\\right\\}\\Rightarrow \\beta \\parallel \\alpha `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_8.png",
                    import.meta.url
                ).href,
                text: "\\alpha \\parallel \\beta , \\gamma \\cap \\alpha =a, \\gamma \\cap \\beta =b \\Rightarrow a \\parallel b "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_9.png",
                    import.meta.url
                ).href,
                text: "A \\in l,B \\in l,A \\in \\alpha ,B \\in \\alpha \\Rightarrow l \\subset \\alpha "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_10.png",
                    import.meta.url
                ).href,
                text: `\\left.\\begin{matrix} 
                m \\subset \\alpha ,n \\subset \\alpha ,m \\cap n=P \\\\  
                a \\perp m,a \\perp n 
              \\end{matrix}\\right\\}\\Rightarrow a \\perp \\alpha `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/geometry/geometry_11.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                \\text{直角三角形中,直角边长a,b,斜边边长c} \\\\ 
                a^{2}+b^{2}=c^{2} 
              \\end{array} `
            }
        ]
    },

    {
        title: "不等式",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_1.png",
                    import.meta.url
                ).href,
                text: "a > b,b > c \\Rightarrow a > c "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_2.png",
                    import.meta.url
                ).href,
                text: "a > b,c > d \\Rightarrow a+c > b+d "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_3.png",
                    import.meta.url
                ).href,
                text: "a > b > 0,c > d > 0 \\Rightarrow ac > bd "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_4.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                a \\gt b,c \\gt 0 \\Rightarrow ac \\gt bc \\\\ 
                a \\gt b,c \\lt 0 \\Rightarrow ac \\lt bc 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_5.png",
                    import.meta.url
                ).href,
                text: "\\left | a-b \\right | \\geqslant \\left | a \\right | -\\left | b \\right | "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_6.png",
                    import.meta.url
                ).href,
                text: "-\\left | a \\right |\\leq a\\leqslant \\left | a \\right | "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_7.png",
                    import.meta.url
                ).href,
                text: "\\left | a \\right |\\leqslant b \\Rightarrow -b \\leqslant a \\leqslant \\left | b \\right | "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_8.png",
                    import.meta.url
                ).href,
                text: "\\left | a+b \\right | \\leqslant \\left | a \\right | + \\left | b \\right | "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_9.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                a \\gt b \\gt 0,n \\in N^{\\ast},n \\gt 1 \\\\ 
                \\Rightarrow a^{n}\\gt b^{n}, \\sqrt[n]{a}\\gt \\sqrt[n]{b} 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_10.png",
                    import.meta.url
                ).href,
                text: "\\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2}\\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_11.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                a,b \\in R^{+} \\\\  
                \\Rightarrow \\frac{a+b}{{2}}\\ge \\sqrt{ab} \\\\  
                \\left( \\text{当且仅当}a=b\\text{时取“}=\\text{”号}\\right) 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_12.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                a,b \\in R \\\\  
                \\Rightarrow a^{2}+b^{2}\\gt 2ab \\\\  
                \\left( \\text{当且仅当}a=b\\text{时取“}=\\text{”号}\\right) 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/inequality/inequality_13.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                H_{n}=\\frac{n}{\\sum \\limits_{i=1}^{n}\\frac{1}{x_{i}}}= \\frac{n}{\\frac{1}{x_{1}}+ \\frac{1}{x_{2}}+ \\cdots + \\frac{1}{x_{n}}} \\\\ G_{n}=\\sqrt[n]{\\prod \\limits_{i=1}^{n}x_{i}}= \\sqrt[n]{x_{1}x_{2}\\cdots x_{n}} \\\\ A_{n}=\\frac{1}{n}\\sum \\limits_{i=1}^{n}x_{i}=\\frac{x_{1}+ x_{2}+ \\cdots + x_{n}}{n} \\\\ Q_{n}=\\sqrt{\\sum \\limits_{i=1}^{n}x_{i}^{2}}= \\sqrt{\\frac{x_{1}^{2}+ x_{2}^{2}+ \\cdots + x_{n}^{2}}{n}} \\\\ H_{n}\\leq G_{n}\\leq A_{n}\\leq Q_{n} 
              \\end{array} `
            }
        ]
    },

    {
        title: "积分",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_1.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\mathrm{d}}{\\mathrm{d}x}x^n=nx^{n-1} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_2.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\mathrm{d}}{\\mathrm{d}x}e^{ax}=a\\,e^{ax} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_3.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\mathrm{d}}{\\mathrm{d}x}\\ln(x)=\\frac{1}{x} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_4.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\mathrm{d}}{\\mathrm{d}x}\\sin x=\\cos x "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_5.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\mathrm{d}}{\\mathrm{d}x}\\cos x=-\\sin x "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_6.png",
                    import.meta.url
                ).href,
                text: "\\int k\\mathrm{d}x = kx+C "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_7.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\mathrm{d}}{\\mathrm{d}x}\\tan x=\\sec^2 x "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_8.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\mathrm{d}}{\\mathrm{d}x}\\cot x=-\\csc^2 x "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_9.png",
                    import.meta.url
                ).href,
                text: "\\int \\frac{1}{x}\\mathrm{d}x= \\ln \\left| x \\right| +C "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_10.png",
                    import.meta.url
                ).href,
                text: "\\int \\frac{1}{\\sqrt{1-x^{2}}}\\mathrm{d}x= \\arcsin x +C "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_11.png",
                    import.meta.url
                ).href,
                text: "\\int \\frac{1}{1+x^{2}}\\mathrm{d}x= \\arctan x +C"
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_12.png",
                    import.meta.url
                ).href,
                text: "\\int u \\frac{\\mathrm{d}v}{\\mathrm{d}x}\\,\\mathrm{d}x=uv-\\int \\frac{\\mathrm{d}u}{\\mathrm{d}x}v\\,\\mathrm{d}x "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_13.png",
                    import.meta.url
                ).href,
                text: "f(x) = \\int_{-\\infty}^\\infty  \\hat f(x)\\xi\\,e^{2 \\pi i \\xi x}  \\,\\mathrm{d}\\xi "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/calculous/calculous_14.png",
                    import.meta.url
                ).href,
                text: "\\int x^{\\mu}\\mathrm{d}x=\\frac{x^{\\mu +1}}{\\mu +1}+C, \\left({\\mu \\neq -1}\\right) "
            }
        ]
    },

    {
        title: "矩阵",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/array/array_1.png",
                    import.meta.url
                ).href,
                text: `\\begin{pmatrix}  
                1 & 0 \\\\  
                0 & 1  
              \\end{pmatrix} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/array/array_2.png",
                    import.meta.url
                ).href,
                text: `\\begin{pmatrix}  
                a_{11} & a_{12} & a_{13} \\\\  
                a_{21} & a_{22} & a_{23} \\\\  
                a_{31} & a_{32} & a_{33}  
              \\end{pmatrix}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/array/array_3.png",
                    import.meta.url
                ).href,
                text: `\\begin{pmatrix}  
                a_{11} & \\cdots & a_{1n} \\\\  
                \\vdots & \\ddots & \\vdots \\\\  
                a_{m1} & \\cdots & a_{mn}  
              \\end{pmatrix} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/array/array_4.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                A=A^{T}  \\\\ 
                A=-A^{T} 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/array/array_5.png",
                    import.meta.url
                ).href,
                text: `O = \\begin{bmatrix}  
                0 & 0 & \\cdots & 0 \\\\  
                0 & 0 & \\cdots & 0 \\\\  
                \\vdots & \\vdots & \\ddots & \\vdots \\\\  
                0 & 0 & \\cdots & 0  
              \\end{bmatrix} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/array/array_6.png",
                    import.meta.url
                ).href,
                text: `A_{m\\times n}=  
                \\begin{bmatrix}  
                  a_{11}& a_{12}& \\cdots  & a_{1n} \\\\  
                  a_{21}& a_{22}& \\cdots  & a_{2n} \\\\  
                  \\vdots & \\vdots & \\ddots & \\vdots \\\\  
                  a_{m1}& a_{m2}& \\cdots  & a_{mn}  
                \\end{bmatrix}  
                =\\left [ a_{ij}\\right ] `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/array/array_7.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                A={\\left[ a_{ij}\\right]_{m \\times n}},B={\\left[ b_{ij}\\right]_{n \\times s}} \\\\  
                c_{ij}= \\sum \\limits_{k=1}^{{n}}a_{ik}b_{kj} \\\\  
                C=AB=\\left[ c_{ij}\\right]_{m \\times s}  
                = \\left[ \\sum \\limits_{k=1}^{n}a_{ik}b_{kj}\\right]_{m \\times s} 
              \\end{array}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/array/array_8.png",
                    import.meta.url
                ).href,
                text: `\\mathbf{V}_1 \\times \\mathbf{V}_2 =  
                \\begin{vmatrix}  
                  \\mathbf{i}& \\mathbf{j}& \\mathbf{k} \\\\  
                  \\frac{\\partial X}{\\partial u}& \\frac{\\partial Y}{\\partial u}& 0 \\\\  
                  \\frac{\\partial X}{\\partial v}& \\frac{\\partial Y}{\\partial v}& 0 \\\\  
                \\end{vmatrix}`
            }
        ]
    },

    {
        title: "三角",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_1.png",
                    import.meta.url
                ).href,
                text: "e^{i \\theta} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_2.png",
                    import.meta.url
                ).href,
                text: "\\left(\\frac{\\pi}{2}-\\theta \\right ) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_3.png",
                    import.meta.url
                ).href,
                text: "\\text{sin}^{2}\\frac{\\alpha}{2}=\\frac{1- \\text{cos}\\alpha}{2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_4.png",
                    import.meta.url
                ).href,
                text: "\\text{cos}^{2}\\frac{\\alpha}{2}=\\frac{1+ \\text{cos}\\alpha}{2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_5.png",
                    import.meta.url
                ).href,
                text: "\\text{tan}\\frac{\\alpha}{2}=\\frac{\\text{sin}\\alpha}{1+ \\text{cos}\\alpha} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_6.png",
                    import.meta.url
                ).href,
                text: "\\sin \\alpha + \\sin \\beta =2 \\sin \\frac{\\alpha + \\beta}{2}\\cos \\frac{\\alpha - \\beta}{2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_7.png",
                    import.meta.url
                ).href,
                text: "\\sin \\alpha - \\sin \\beta =2 \\cos \\frac{\\alpha + \\beta}{2}\\sin \\frac{\\alpha - \\beta}{2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_8.png",
                    import.meta.url
                ).href,
                text: "\\cos \\alpha + \\cos \\beta =2 \\cos \\frac{\\alpha + \\beta}{2}\\cos \\frac{\\alpha - \\beta}{2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_9.png",
                    import.meta.url
                ).href,
                text: "\\cos \\alpha - \\cos \\beta =-2\\sin \\frac{\\alpha + \\beta}{2}\\sin \\frac{\\alpha - \\beta}{2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_10.png",
                    import.meta.url
                ).href,
                text: "a^{2}=b^{2}+c^{2}-2bc\\cos A "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_11.png",
                    import.meta.url
                ).href,
                text: "\\frac{\\sin A}{a}=\\frac{\\sin B}{b}=\\frac{\\sin C}{c}=\\frac{1}{2R} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_12.png",
                    import.meta.url
                ).href,
                text: "\\sin \\left ( \\frac{\\pi}{2}-\\alpha \\right ) = \\cos \\alpha "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/trigonometry/trigonometry_13.png",
                    import.meta.url
                ).href,
                text: "\\sin \\left ( \\frac{\\pi}{2}+\\alpha \\right ) = \\cos \\alpha "
            }
        ]
    },

    {
        title: "统计",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_1.png",
                    import.meta.url
                ).href,
                text: "C_{r}^{n} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_2.png",
                    import.meta.url
                ).href,
                text: "\\frac{n!}{r!(n-r)!} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_3.png",
                    import.meta.url
                ).href,
                text: "\\sum_{i=1}^{n}{X_i} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_4.png",
                    import.meta.url
                ).href,
                text: "\\sum_{i=1}^{n}{X_i^2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_5.png",
                    import.meta.url
                ).href,
                text: "X_1, \\cdots,X_n "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_6.png",
                    import.meta.url
                ).href,
                text: "\\frac{x-\\mu}{\\sigma} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_7.png",
                    import.meta.url
                ).href,
                text: "\\sum_{i=1}^{n}{(X_i - \\overline{X})^2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_8.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                \\text{若}P \\left( AB \\right) =P \\left( A \\right) P \\left( B \\right) \\\\ 
                \\text{则}P \\left( A \\left| B\\right. \\right) =P \\left({B}\\right) 
              \\end{array}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_9.png",
                    import.meta.url
                ).href,
                text: "P(E) ={n \\choose k}p^k (1-p)^{n-k} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_10.png",
                    import.meta.url
                ).href,
                text: "P \\left( A \\right) = \\lim \\limits_{n \\to \\infty}f_{n}\\left ( A \\right ) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_11.png",
                    import.meta.url
                ).href,
                text: "P \\left( \\bigcup \\limits_{i=1}^{+ \\infty}A_{i}\\right) = \\prod \\limits_{i=1}^{+ \\infty}P{\\left( A_{i}\\right)} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_12.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                P \\left( \\emptyset \\right) =0 \\\\ 
                P \\left( S \\right) =1 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_13.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                \\forall A \\in S \\\\ 
                P \\left( A \\right) \\ge 0 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_14.png",
                    import.meta.url
                ).href,
                text: "P \\left( \\bigcup \\limits_{i=1}^{n}A_{i}\\right) = \\prod \\limits_{i=1}^{n}P \\left( A_{i}\\right) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_15.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                S= \\binom{N}{n},A_{k}=\\binom{M}{k}\\cdot \\binom{N-M}{n-k} \\\\ 
                P\\left ( A_{k}\\right ) = \\frac{\\binom{M}{k}\\cdot \\binom{N-M}{n-k}}{\\binom{N}{n}} 
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/statistics/statistics_16.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                P_{n}=n! \\\\ 
                A_{n}^{k}=\\frac{n!}{\\left( n-k \\left) !\\right. \\right.} 
              \\end{array} `
            }
        ]
    },

    {
        title: "数列",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_1.png",
                    import.meta.url
                ).href,
                text: "a_{n}=a_{1}q^{n-1} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_2.png",
                    import.meta.url
                ).href,
                text: "a_{n}=a_{1}+ \\left( n-1 \\left) d\\right. \\right. "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_3.png",
                    import.meta.url
                ).href,
                text: "S_{n}=na_{1}+\\frac{n \\left( n-1 \\right)}{{2}}d "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_4.png",
                    import.meta.url
                ).href,
                text: "S_{n}=\\frac{n \\left( a_{1}+a_{n}\\right)}{2} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_5.png",
                    import.meta.url
                ).href,
                text: "\\frac{1}{n \\left( n+k \\right)}= \\frac{1}{k}\\left( \\frac{1}{n}-\\frac{1}{n+k}\\right) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_6.png",
                    import.meta.url
                ).href,
                text: "\\frac{1}{n^{2}-1}= \\frac{1}{2}\\left( \\frac{1}{n-1}-\\frac{1}{n+1}\\right) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_7.png",
                    import.meta.url
                ).href,
                text: "\\frac{1}{4n^{2}-1}=\\frac{1}{2}\\left( \\frac{1}{2n-1}-\\frac{1}{2n+1}\\right) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_8.png",
                    import.meta.url
                ).href,
                text: "\\frac{n+1}{n \\left( n-1 \\left) \\cdot 2^{n}\\right. \\right.}= \\frac{1}{\\left( n-1 \\left) \\cdot 2^{n-1}\\right. \\right.}-\\frac{1}{n \\cdot 2^{n}} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_9.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{c} 
                \\text{若}\\left \\{a_{n}\\right \\}、\\left \\{b_{n}\\right \\}\\text{为等差数列}, \\\\ 
                \\text{则}\\left \\{a_{n}+ b_{n}\\right \\}\\text{为等差数列} 
              \\end{array}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/sequence/sequence_10.png",
                    import.meta.url
                ).href,
                text: "(1+x)^{n} =1 + \\frac{nx}{1!} + \\frac{n(n-1)x^{2}}{2!} + \\cdots "
            }
        ]
    },

    {
        title: "物理",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_1.png",
                    import.meta.url
                ).href,
                text: "\\sum {{{ \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over F} }_i}} = \\frac{{d \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over v} }}{{dt}} = 0 "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_2.png",
                    import.meta.url
                ).href,
                text: "\\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over F}  = m \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}}  \\over a}  = m \\frac{{{d^2} \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over r} }}{{d{t^2}}} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_3.png",
                    import.meta.url
                ).href,
                text: "{{ \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over F} }_{12}} =  - {{ \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}}  \\over F} }_{21}} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_4.png",
                    import.meta.url
                ).href,
                text: "{E_p} = -\\frac{{GMm}}{r} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_5.png",
                    import.meta.url
                ).href,
                text: "\\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}}  \\over F}  = k \\frac{{Qq}}{{{r^2}}} \\hat{r} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_6.png",
                    import.meta.url
                ).href,
                text: "\\oint_L { \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over E} } \\cdot { \\rm{d}} \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}}  \\over l}  = 0 "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_7.png",
                    import.meta.url
                ).href,
                text: "d \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over B} = \\frac{{{ \\mu _0}}}{{4 \\pi }} \\frac{{Idl \\times \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over r} }}{{{r^3}}} =  \\frac{{{ \\mu _0}}}{{4 \\pi }} \\frac{{Idl \\sin \\theta }}{{{r^2}}} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_8.png",
                    import.meta.url
                ).href,
                text: "d \\vec{F}= Id \\vec{l} \\times \\vec{B} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_9.png",
                    import.meta.url
                ).href,
                text: "E = n{{ \\Delta \\Phi } \\over {\\Delta {t} }} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_10.png",
                    import.meta.url
                ).href,
                text: "\\mathop \\Phi \\nolimits_e = \\oint { \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over E} \\cdot {d \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over S}}  = {1 \\over {{\\varepsilon _0}}}\\sum {q} } "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_11.png",
                    import.meta.url
                ).href,
                text: "\\oint { \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over E} \\cdot {d\\mathord{\\buildrel{\\lower3pt\\hbox{$\\scriptscriptstyle\\rightharpoonup$}}\\over l}}  =  - {{d{\\varphi _B}} \\over {dt}}} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_12.png",
                    import.meta.url
                ).href,
                text: "\\oint { \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over B} \\cdot {d \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over l}}  = { \\mu _0}} I + { \\mu _0}{I_d} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_13.png",
                    import.meta.url
                ).href,
                text: "Q = I ^ { 2 } R \\mathrm { t } "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_14.png",
                    import.meta.url
                ).href,
                text: "F = G{{Mm} \\over {{r^2}}} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_15.png",
                    import.meta.url
                ).href,
                text: "{E_k} = hv - {W_0} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_16.png",
                    import.meta.url
                ).href,
                text: "\\lambda = \\frac{{ \\frac{{{c^2}}}{v}}}{{ \\frac{{m{c^2}}}{h}}} = \\frac{h}{{mv}} = \\frac{h}{p} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_17.png",
                    import.meta.url
                ).href,
                text: "\\Delta {x} \\Delta {p} \\ge \\frac{h}{{4 \\pi }} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_18.png",
                    import.meta.url
                ).href,
                text: "l = {l_0} \\sqrt {1 - {{( \\frac{v}{c})}^2}}  "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_19.png",
                    import.meta.url
                ).href,
                text: "{y_0} = A \\cos ( \\omega {t} + { \\varphi _0}) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_20.png",
                    import.meta.url
                ).href,
                text: "y(t) = A \\cos ( \\frac{{2 \\pi {x}}}{ \\lambda } +  \\varphi ) "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_21.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{l}  
                \\nabla \\cdot \\mathbf{E} =\\cfrac{\\rho}{\\varepsilon _0}  \\\\  
                \\nabla \\cdot \\mathbf{B} = 0 \\\\  
                \\nabla \\times \\mathbf{E} = -\\cfrac{\\partial \\mathbf{B}}{\\partial t }  \\\\  
                \\nabla \\times \\mathbf{B} = \\mu _0\\mathbf{J} + \\mu _0\\varepsilon_0 \\cfrac{\\partial \\mathbf{E}}{\\partial t }   
              \\end{array}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_22.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{l}  
                  {\\huge \\unicode{8751}}_\\mathbb{S}  \\mathbf{E} \\cdot\\mathrm{d}s= \\cfrac{Q}{\\varepsilon_0}  \\\\  
                  {\\huge \\unicode{8751}}_\\mathbb{S}  \\mathbf{B} \\cdot\\mathrm{d}s= 0 \\\\  
                  {\\huge \\oint}_{\\mathbb{L}}^{} \\mathbf{E} \\cdot \\mathrm{d}l=-\\cfrac{\\mathrm{d}\\Phi _{\\mathbf{B}}}{\\mathrm{d}t }  \\\\  
                  {\\huge \\oint}_{\\mathbb{L}}^{} \\mathbf{B} \\cdot \\mathrm{d}l=\\mu_0I+ \\mu_0 \\varepsilon_0\\cfrac{\\mathrm{d}\\Phi _{\\mathbf{E}}}{\\mathrm{d}t }   
                \\end{array}`
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_23.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{l}  
                \\nabla \\cdot \\mathbf{D} =\\rho _f \\\\ 
                \\nabla \\cdot \\mathbf{B} = 0 \\\\  
                \\nabla \\times  \\mathbf{E} = -\\cfrac{\\partial \\mathbf{B}}{\\partial t }  \\\\  
                \\nabla \\times  \\mathbf{H} = \\mathbf{J}_f +  \\cfrac{\\partial \\mathbf{D}}{\\partial t }   
              \\end{array} `
            },

            {
                url: new URL(
                    "@/assets/latex/preset/physics/physics_24.png",
                    import.meta.url
                ).href,
                text: `\\begin{array}{l}  
                  {\\huge \\unicode{8751}}_\\mathbb{S}  \\mathbf{D} \\cdot\\mathrm{d}s= Q_f \\\\  
                  {\\huge \\unicode{8751}}_\\mathbb{S}  \\mathbf{B} \\cdot\\mathrm{d}s= 0 \\\\  
                  {\\huge \\oint}_{\\mathbb{L}}^{} \\mathbf{E} \\cdot \\mathrm{d}l=-\\cfrac{\\mathrm{d}\\Phi _{\\mathbf{B}}}{\\mathrm{d}t }  \\\\  
                  {\\huge \\oint}_{\\mathbb{L}}^{} \\mathbf{H} \\cdot \\mathrm{d}l=I_f+\\cfrac{\\mathrm{d}\\Phi _{\\mathbf{D}}}{\\mathrm{d}t }   
                \\end{array}`
            }
        ]
    },

    {
        title: "化学",
        list: [
            {
                url: new URL(
                    "@/assets/latex/preset/chemistry/chemistry_1.png",
                    import.meta.url
                ).href,
                text: "\\ce{SO4^2- + Ba^2+ -> BaSO4 v} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/chemistry/chemistry_2.png",
                    import.meta.url
                ).href,
                text: "\\ce{A v B (v) -> B ^ B (^)} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/chemistry/chemistry_3.png",
                    import.meta.url
                ).href,
                text: "\\ce{Hg^2+ ->[I-]  $\\underset{\\mathrm{red}}{\\ce{HgI2}}$  ->[I-]  $\\underset{\\mathrm{red}}{\\ce{[Hg^{II}I4]^2-}}$} "
            },

            {
                url: new URL(
                    "@/assets/latex/preset/chemistry/chemistry_4.png",
                    import.meta.url
                ).href,
                text: "\\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{amphoteres Hydroxid}}{\\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{Hydroxozikat}}{\\ce{[Zn(OH)4]^2-}}$} "
            }
        ]
    }
];
