import FounderHero from "./FounderHero";

export const metadata = {
  title: "Founder’s Letter | Braxy Buns Carwash",
  description: "A letter from the founder of Braxy Buns Carwash.",
};

const AUTISM_GRADIENT =
  "linear-gradient(90deg,#E40303 0%,#FF8C00 18%,#FFED00 34%,#008026 50%,#004DFF 68%,#750787 100%)";

const INK = "#061426";
const INK_2 = "#071b33";
const INK_3 = "#0a2b4b";

export default function FoundersLetterPage() {
  return (
    <main
      className="min-h-screen text-white"
      style={{
        backgroundImage: `linear-gradient(180deg, ${INK} 0%, ${INK_2} 60%, ${INK_3} 100%)`,
      }}
    >
      <div className="mx-auto max-w-4xl px-6 py-20">
        {/* Logo + animated halo */}
        <FounderHero />

        {/* Letter Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-white/60">
            A Letter From the Founder
          </p>

          {/* Gradient Divider */}
          <div
            className="my-6 h-[2px] w-full rounded-full"
            style={{ backgroundImage: AUTISM_GRADIENT }}
          />

          <div className="space-y-6 text-[17px] leading-relaxed text-white/85">
            <p className="font-medium text-white">
              Braxy Buns Carwash was not created by accident.
            </p>

            <p>
              It was born from faith, shaped by family, and refined through
              seasons that tested and strengthened us.
            </p>

            <p>
              My wife, Jessica, and I are blessed to be raising our son, Braxton.
              Jessica has stepped fully and faithfully into her role as Braxton’s
              stepmom, loving him with strength, patience, and devotion. Together,
              we have built our family on faith and resilience.
            </p>

            <p>
              Braxton is neurodiverse, and through him, God transformed the way we
              see leadership, purpose, and legacy.
            </p>

            <p className="font-semibold text-white text-lg">
              He has a remarkable gift — joy.
            </p>

            <p>
              Braxton can walk into a room and make anyone laugh. Laughing is his
              favorite thing to do. Whether he’s delivering perfectly timed humor
              or turning up EDM or country music without hesitation, he reminds us
              daily that joy is not dependent on circumstance. It is chosen.
            </p>

            <p>
              There were seasons when we did not fully understand the path God was
              placing before us. There were long nights of prayer, moments of
              uncertainty, and challenges that stretched our faith. But through it
              all, one truth became clear:
            </p>

            <p className="font-semibold text-white text-lg">
              God was not only shaping Braxton.
              <br />
              He was shaping us.
            </p>

            <p>
              He was building resilience.
              <br />
              He was building trust.
              <br />
              He was building purpose.
            </p>

            <p className="font-semibold text-white">
              Braxy Buns Carwash is our response to that purpose.
            </p>

            <p>
              We believe excellence honors God.
              <br />
              We believe business is a platform for impact.
              <br />
              We believe joy changes atmospheres.
            </p>

            <p>
              This company exists to deliver premium service with integrity while
              supporting autism awareness and neurodiverse families in meaningful
              ways. Every wash represents an opportunity to serve well and to give
              back.
            </p>

            <p className="font-semibold text-white">
              The name Braxy Buns is more than a brand.
            </p>

            <p>
              It is a reminder that leadership begins at home. That faith sustains
              us through uncertainty. And that joy is one of God’s greatest gifts.
            </p>

            {/* Scripture Box */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-widest text-white/60">
                Scripture
              </p>
              <p className="mt-3 text-[17px] leading-relaxed text-white/90 italic">
                “For I know the plans I have for you,” declares the Lord, “plans
                to prosper you and not to harm you, plans to give you hope and a
                future.”
              </p>
              <p className="mt-3 text-sm text-white/70">— Jeremiah 29:11</p>
            </div>

            <p>
              That promise carried us when we needed it most, and it continues to
              guide this company today.
            </p>

            <p className="font-semibold text-white">Our commitment is clear:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>To honor God in how we operate.</li>
              <li>To pursue excellence in every detail.</li>
              <li>To support autism and neurodiverse communities authentically.</li>
              <li>
                To build something our family — and our community — will be proud
                of.
              </li>
            </ul>

            <p className="font-semibold text-white text-lg">
              Braxy Buns Carwash is more than a business.
            </p>

            <p className="font-semibold text-white text-lg">It is our assignment.</p>

            <p className="pt-6">
              — <span className="font-semibold text-white">Dennis Bosworth</span>
              <br />
              Founder
            </p>

            <div className="pt-4">
              <a
                href="/"
                className="inline-block rounded-2xl border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
