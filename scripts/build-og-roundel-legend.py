# ABOUTME: Regenerates lib/ogRoundelLegend.js: the roundel's ring legend set along a circle as one SVG path.
# ABOUTME: Mirrors components/Roundel.js (textPath r=44, DM Mono 500 at 10.5, textLength 271, dy 3.6) with fontTools.

"""Usage (fontTools is NOT a project dependency; use a throwaway venv):

    python3 -m venv /tmp/legend-venv && /tmp/legend-venv/bin/pip install fonttools
    curl -o /tmp/DMMono-Medium.ttf https://fonts.gstatic.com/s/dmmono/v16/aFTR7PB1QTsUX8KYvumzIYQ.ttf
    /tmp/legend-venv/bin/python scripts/build-og-roundel-legend.py /tmp/DMMono-Medium.ttf > /tmp/legend.txt

The font URL is what the Google Fonts CSS API serves for DM Mono wght 500 (SIL Open Font
License 1.1, https://fonts.google.com/specimen/DM+Mono). Paste the printed path into
LEGEND_PATH in lib/ogRoundelLegend.js. Run against that font file it reproduces the
committed path byte for byte.
"""

import math
import sys

from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

# Keep these in step with components/Roundel.js.
LEGEND = "CRASH LOG · FILED · CRASH LOG · FILED · "
RADIUS = 44.0  # textPath circle radius in the 120 viewBox
FONT_SIZE = 10.5
TEXT_LENGTH = 271.0  # textLength with lengthAdjust="spacing"
DY = 3.6  # shifts the baseline toward the ring's centre
CENTRE = 60.0


class PathPen(BasePen):
    """Collects an SVG path string, quadratic segments kept as Q, 2 decimals."""

    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.d = []
        self._last = None

    @staticmethod
    def _n(v):
        s = f"{v:.2f}".rstrip("0").rstrip(".")
        return "0" if s in ("-0", "") else s

    def _pt(self, p):
        return f"{self._n(p[0])} {self._n(p[1])}"

    def _moveTo(self, p):
        self.d.append(f"M{self._pt(p)}")
        self._last = "M"

    def _lineTo(self, p):
        # Lines that directly follow a moveTo are implied (no letter, one space), as are
        # the lines after those; a lineTo after a curve or a lettered line carries its "L".
        if self._last in ("M", "implied"):
            self.d.append(f" {self._pt(p)}")
            self._last = "implied"
        else:
            self.d.append(f"L{self._pt(p)}")
            self._last = "L"

    def _qCurveToOne(self, p1, p2):
        self.d.append(f"Q{self._pt(p1)} {self._pt(p2)}")
        self._last = "Q"

    def _closePath(self):
        self.d.append("Z")
        self._last = "Z"


def build(font_path):
    font = TTFont(font_path)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = FONT_SIZE / font["head"].unitsPerEm
    names = [cmap[ord(c)] for c in LEGEND]
    advances = [glyphs[n].width * scale for n in names]
    # lengthAdjust="spacing" spreads the shortfall evenly across the glyph gaps.
    extra = (TEXT_LENGTH - sum(advances)) / len(LEGEND)
    out = []
    pos = 0.0
    for name, adv in zip(names, advances):
        mid = pos + extra / 2 + adv / 2  # spacing is split across both sides of a glyph
        phi = math.pi + mid / RADIUS  # clockwise from the circle's left-most point
        px = CENTRE + RADIUS * math.cos(phi)
        py = CENTRE + RADIUS * math.sin(phi)
        psi = phi + math.pi / 2  # tangent direction
        c, s = math.cos(psi), math.sin(psi)
        # Glyph units -> user units (y flipped), centred on its advance, baseline moved by
        # DY, rotated onto the tangent and placed at the arc point:
        #   x' = c*(gx*scale - adv/2) - s*(-gy*scale + DY) + px
        #   y' = s*(gx*scale - adv/2) + c*(-gy*scale + DY) + py
        t = (
            c * scale, s * scale,
            s * scale, -c * scale,
            px + (-c * adv / 2 - s * DY), py + (-s * adv / 2 + c * DY),
        )
        pen = PathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, t))
        out.extend(pen.d)
        pos += adv + extra
    return "".join(out)


if __name__ == "__main__":
    print(build(sys.argv[1]))
