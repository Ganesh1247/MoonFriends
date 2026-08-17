'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCollection } from '@/lib/actions/collections';
import { PAYMENT_MODES } from '@/lib/constants';
import { getTodayDate, getCurrentTime, formatRupees } from '@/lib/utils';
import { CelebrationConfetti } from '@/components/moon/celebration-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowDownLeft, Sparkles, CheckCircle2, Receipt, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const NOTE_TEMPLATES = [
  'Contribution received from family for Vinayaka Chavithi celebration.',
  'Chanda contribution towards main idol installation and daily pooja rituals.',
  'Devotional sponsorship for Annadanam Maha Prasadam distribution.',
  'Annual colony household Ganesh festival chanda contribution.',
];

export default function NewCollectionPage() {
  const router = useRouter();

  const [contributorName, setContributorName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<string>('upi');
  const [collectionDate, setCollectionDate] = useState(getTodayDate());
  const [collectionTime, setCollectionTime] = useState(getCurrentTime());
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successData, setSuccessData] = useState<{ transactionId: string; id: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation
    if (!contributorName.trim()) {
      toast.error('Contributor Name is required');
      return;
    }
    if (!houseNumber.trim()) {
      toast.error('House/Door number is required');
      return;
    }
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error('Enter a valid 10-digit Indian phone number (e.g. 9849012345)');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid positive amount');
      return;
    }
    if (!note.trim()) {
      toast.error('Mandatory Note is required for every transaction');
      return;
    }

    setLoading(true);
    try {
      const res = await createCollection({
        contributorName: contributorName.trim(),
        houseNumber: houseNumber.trim(),
        phone: phone.trim(),
        amount: Number(amount),
        paymentMode,
        collectionDate,
        collectionTime,
        note: note.trim(),
      });

      if (res.success && res.data) {
        setShowConfetti(true);
        setSuccessData(res.data);
        toast.success(`Collection ${res.data.transactionId} recorded successfully!`);
      } else {
        toast.error(res.error || 'Failed to record collection');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CelebrationConfetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Back button + Title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/collections">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-money-in" />
            Add Chanda Collection
          </h1>
          <p className="text-xs text-muted-foreground">
            Record a contribution from a neighbour or community member
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="glass border-border/50 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-gradient-gold">
            Collection Details
          </CardTitle>
          <CardDescription className="text-xs">
            Optimized for fast mobile entry — all fields strictly verified
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* Amount (Hero Input) */}
            <div className="p-4 rounded-2xl bg-money-in-bg/40 border border-money-in/30 space-y-3">
              <Label htmlFor="amount" className="text-xs font-bold text-money-in uppercase tracking-wider">
                Collection Amount (₹) *
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-2 text-2xl font-extrabold text-money-in">₹</span>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="pl-10 text-2xl font-extrabold h-14 bg-background/80 border-money-in/40 text-money-in focus:border-money-in"
                  required
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground mr-1">Quick:</span>
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-background/80 hover:bg-money-in hover:text-night-deep border border-border/50 transition-colors"
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Contributor Name & House Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Contributor / Family Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. K. Satyanarayana"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="bg-background/50 border-border/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="house" className="text-xs font-semibold text-foreground">
                  House / Flat / Door No *
                </Label>
                <Input
                  id="house"
                  placeholder="e.g. 3-42 or Flat 204"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="bg-background/50 border-border/60"
                  required
                />
              </div>
            </div>

            {/* Phone Number & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                  10-Digit Mobile Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="e.g. 9849012345"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="bg-background/50 border-border/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Payment Mode *
                </Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PAYMENT_MODES.slice(0, 3).map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setPaymentMode(mode.value)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        paymentMode === mode.value
                          ? 'bg-gold text-night-deep border-gold shadow-md font-bold'
                          : 'bg-card/60 border-border/40 text-muted-foreground hover:bg-accent/40'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mandatory Note Section */}
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="note" className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Mandatory Transaction Note *
                </Label>
                <span className="text-[10px] text-muted-foreground">Required by financial audit rule</span>
              </div>
              <Textarea
                id="note"
                placeholder="Describe the purpose of this contribution (e.g. Family contribution for idol installation & Annadanam)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="bg-background/50 border-gold/30 focus:border-gold text-xs"
                required
              />

              {/* Note Templates */}
              <div className="space-y-1 pt-1">
                <p className="text-[10px] text-muted-foreground">Quick Templates (click to fill):</p>
                <div className="flex flex-wrap gap-1">
                  {NOTE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNote(tmpl)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-card/60 border border-border/30 text-muted-foreground hover:text-gold hover:border-gold/30 truncate max-w-full text-left"
                    >
                      + {tmpl.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-money-in hover:bg-money-in/90 text-night-deep font-bold h-12 text-base shadow-xl glow-money-in mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Recording & Auditing Transaction...
                </>
              ) : (
                `Confirm & Record Collection of ${amount ? formatRupees(Number(amount)) : '₹0'}`
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Success Modal / Receipt Preview */}
      <Dialog open={!!successData} onOpenChange={() => { setSuccessData(null); router.push('/dashboard/collections'); }}>
        <DialogContent className="glass border-gold/30 max-w-md text-center p-6 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-money-in/15 flex items-center justify-center glow-money-in">
              <CheckCircle2 className="w-10 h-10 text-money-in" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gradient-gold">
              Collection Recorded!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official receipt generated: <span className="font-mono font-bold text-gold">{successData?.transactionId}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Receipt Summary Box */}
          <div className="p-4 rounded-xl bg-card/80 border border-gold/20 text-left space-y-2 text-xs font-mono">
            <div className="text-center font-bold text-sm text-gold pb-1 border-b border-border/30">
              🌙 MOON FRIENDS — CHANDA RECEIPT
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Received From:</span>
              <span className="font-bold text-foreground">{contributorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">House No:</span>
              <span>#{houseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-money-in text-sm">{formatRupees(Number(amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Mode:</span>
              <span className="uppercase">{paymentMode}</span>
            </div>
            <div className="pt-1 border-t border-border/20 text-[11px] text-muted-foreground">
              Note: &ldquo;{note}&rdquo;
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-gold/30 text-gold"
              onClick={() => {
                setContributorName('');
                setHouseNumber('');
                setPhone('');
                setAmount('');
                setNote('');
                setSuccessData(null);
              }}
            >
              + Next Collection
            </Button>
            <Link href={`/dashboard/collections/${successData?.id}`} className="flex-1">
              <Button className="w-full bg-gold hover:bg-gold-dark text-night-deep font-bold">
                <Receipt className="w-4 h-4 mr-1.5" /> View Receipt
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
