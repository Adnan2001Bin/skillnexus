"use client";
import TagInput from "./TagInput";
import SocialLinksEditor from "./SocialLinksEditor";

type RatePlan = {
  type: "Basic" | "Standard" | "Premium";
  price: number;
  description: string;
  whatsIncluded: string[];
  deliveryDays: number;
  revisions: number;
};

export default function PackagesStep({
  inputClass,
  ratePlans,
  aboutThisGig,
  socialLinks,
  onUpdatePlan,
  onChangeAbout,
  onChangeSocialLinks,
}: {
  inputClass: string;
  ratePlans: RatePlan[];
  aboutThisGig: string;
  socialLinks: { platform: string; url: string }[];
  onUpdatePlan: (i: number, patch: Partial<RatePlan>) => void;
  onChangeAbout: (v: string) => void;
  onChangeSocialLinks: (v: { platform: string; url: string }[]) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Packages</h2>
        <p className="mt-1 text-sm text-slate-600">
          Set up your Basic, Standard, and Premium offerings. Be specific so clients know exactly what they’ll get.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ratePlans.map((plan, i) => {
          const idBase = `plan-${plan.type.toLowerCase()}`;
          return (
            <div key={plan.type} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{plan.type} Package</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                  {plan.deliveryDays}d • {plan.revisions} rev
                </span>
              </div>

              <label htmlFor={`${idBase}-price`} className="text-xs font-medium text-slate-700">
                Price (USD)
              </label>
              <input
                id={`${idBase}-price`}
                className={`${inputClass} mt-1`}
                type="number"
                min={0}
                value={plan.price}
                onChange={(e) => onUpdatePlan(i, { price: +e.target.value })}
                placeholder="e.g., 99"
              />

              <label htmlFor={`${idBase}-delivery`} className="mt-3 block text-xs font-medium text-slate-700">
                Delivery time (days)
              </label>
              <input
                id={`${idBase}-delivery`}
                className={`${inputClass} mt-1`}
                type="number"
                min={1}
                value={plan.deliveryDays}
                onChange={(e) => onUpdatePlan(i, { deliveryDays: +e.target.value })}
                placeholder="e.g., 5"
              />

              <label htmlFor={`${idBase}-revisions`} className="mt-3 block text-xs font-medium text-slate-700">
                Number of revisions
              </label>
              <input
                id={`${idBase}-revisions`}
                className={`${inputClass} mt-1`}
                type="number"
                min={0}
                value={plan.revisions}
                onChange={(e) => onUpdatePlan(i, { revisions: +e.target.value })}
                placeholder="e.g., 2"
              />

              <label htmlFor={`${idBase}-desc`} className="mt-3 block text-xs font-medium text-slate-700">
                Short description
              </label>
              <textarea
                id={`${idBase}-desc`}
                className={`${inputClass} mt-1`}
                rows={3}
                value={plan.description}
                onChange={(e) => onUpdatePlan(i, { description: e.target.value })}
                placeholder="Summarize what this package delivers."
              />

              <div className="mt-3">
                <label className="text-xs font-medium text-slate-700">
                  What’s included <span className="text-slate-500">(press Enter to add)</span>
                </label>
                <TagInput
                  values={plan.whatsIncluded}
                  onAdd={(v) =>
                    onUpdatePlan(i, {
                      whatsIncluded: Array.from(new Set([...(plan.whatsIncluded || []), v])),
                    })
                  }
                  onRemove={(v) =>
                    onUpdatePlan(i, {
                      whatsIncluded: (plan.whatsIncluded || []).filter((x) => x !== v),
                    })
                  }
                  placeholder="e.g., Landing page, API integration, Tests"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">About this Gig</label>
          <textarea
            className={`${inputClass} mt-1 w-full`}
            rows={4}
            value={aboutThisGig}
            onChange={(e) => onChangeAbout(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Social Links</label>
          <SocialLinksEditor values={socialLinks} onChange={onChangeSocialLinks} />
        </div>
      </div>
    </div>
  );
}
