import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Shield, 
  AlertTriangle, 
  Car, 
  Home, 
  Wrench, 
  Users,
  Phone,
  MapPin,
  Clock,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  HardHat
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SafetyGuidelines() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-surface">
      <SEOHead 
        title="Safety Guidelines | SaskTask"
        description="Safety is our top priority. Learn about safety guidelines for Task Givers and Task Doers to ensure safe and successful task experiences."
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Safety Guidelines</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Your safety is our top priority. Follow these guidelines to ensure safe and successful experiences on SaskTask.
            </p>
          </div>

          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Emergency Situations</AlertTitle>
            <AlertDescription>
              If you are in immediate danger, call <strong>911</strong> immediately. After ensuring your safety, 
              report the incident to SaskTask at <a href="mailto:safety@sasktask.com" className="underline">safety@sasktask.com</a>.
            </AlertDescription>
          </Alert>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* General Safety */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                General Safety Principles
              </h2>
              <p className="text-muted-foreground mb-4">
                These principles apply to all SaskTask users, whether you're a Task Giver or Task Doer:
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Trust Your Instincts</h4>
                    <p className="text-sm text-green-600 dark:text-green-500">If something feels wrong, it probably is. Don't hesitate to leave or cancel.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Verify Identity</h4>
                    <p className="text-sm text-green-600 dark:text-green-500">Confirm you're meeting the right person using their profile photo and name.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Communicate Through Platform</h4>
                    <p className="text-sm text-green-600 dark:text-green-500">Keep communications on SaskTask for safety and documentation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Share Your Plans</h4>
                    <p className="text-sm text-green-600 dark:text-green-500">Tell a friend or family member about your task location and timing.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Before the Task */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Before the Task
              </h2>

              <h3 className="text-xl font-semibold mb-3">For Task Doers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Review the profile:</strong> Check the Task Giver's reviews, verification status, and history</li>
                <li><strong>Understand the task:</strong> Get clear details about what's expected before accepting</li>
                <li><strong>Verify the location:</strong> Research the address and ensure it's a legitimate location</li>
                <li><strong>Share your schedule:</strong> Let someone know where you'll be and when to expect you back</li>
                <li><strong>Charge your phone:</strong> Ensure your phone is fully charged before heading out</li>
                <li><strong>Plan your route:</strong> Know how to get there and have an exit strategy</li>
                <li><strong>Dress appropriately:</strong> Wear proper safety gear for the type of work</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">For Task Givers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Review the profile:</strong> Check the Task Doer's reviews, ratings, and verifications</li>
                <li><strong>Be available:</strong> Ensure you can be reached during the scheduled time</li>
                <li><strong>Prepare the space:</strong> Clear the work area and remove any hazards</li>
                <li><strong>Secure valuables:</strong> Store valuable items and sensitive documents safely</li>
                <li><strong>Inform household:</strong> Let others in your home know about the scheduled task</li>
              </ul>
            </section>

            {/* During the Task */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                During the Task
              </h2>

              <h3 className="text-xl font-semibold mb-3">For Task Doers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Verify identity:</strong> Confirm you're meeting the person from the booking</li>
                <li><strong>Stay aware:</strong> Be aware of your surroundings at all times</li>
                <li><strong>Keep your phone accessible:</strong> Don't leave your phone unattended</li>
                <li><strong>Maintain boundaries:</strong> Keep interactions professional</li>
                <li><strong>Document if needed:</strong> Take photos of before/after work for your records</li>
                <li><strong>Report concerns:</strong> Contact SaskTask immediately if you feel unsafe</li>
                <li><strong>Leave if necessary:</strong> You can leave at any time if you feel threatened</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">For Task Givers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Be present:</strong> Stay available during the task, especially at the start</li>
                <li><strong>Respect the worker:</strong> Treat Task Doers professionally</li>
                <li><strong>Provide access:</strong> Ensure they have what they need to complete the task</li>
                <li><strong>Keep pets secured:</strong> If you have pets, inform the Task Doer and secure them if needed</li>
                <li><strong>Supervise if appropriate:</strong> Especially for tasks involving expensive items</li>
              </ul>
            </section>

            {/* In-Home Safety */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Home className="w-6 h-6 text-primary" />
                In-Home Task Safety
              </h2>

              <h3 className="text-xl font-semibold mb-3">For Task Doers Entering Homes</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Verify the address matches the booking before entering</li>
                <li>Send a "check-in" message to a friend when you arrive</li>
                <li>Note the exits when you enter a property</li>
                <li>Keep your belongings in one place near an exit</li>
                <li>Don't consume food or drinks offered</li>
                <li>Decline any requests to lock doors behind you</li>
                <li>Leave immediately if anyone behaves inappropriately</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">For Task Givers Hosting Workers</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Don't leave the Task Doer alone in your home if possible</li>
                <li>Secure medications, firearms, and sensitive documents</li>
                <li>Consider having another adult present</li>
                <li>Inform neighbors if a worker will be at your home</li>
                <li>Don't share more personal information than necessary</li>
              </ul>
            </section>

            {/* Vehicle Safety */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Car className="w-6 h-6 text-primary" />
                Vehicle & Transportation Safety
              </h2>

              <h3 className="text-xl font-semibold mb-3">For Delivery & Driving Tasks</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Vehicle condition:</strong> Ensure your vehicle is in safe working condition</li>
                <li><strong>Valid documents:</strong> Keep your license, registration, and insurance current</li>
                <li><strong>Distraction-free:</strong> Don't use your phone while driving</li>
                <li><strong>Safe parking:</strong> Park in well-lit, safe areas</li>
                <li><strong>Secure cargo:</strong> Properly secure any items being transported</li>
                <li><strong>Weather awareness:</strong> Check weather conditions before traveling</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">When Accepting Rides (if applicable)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Verify the driver matches their profile photo</li>
                <li>Confirm the license plate before getting in</li>
                <li>Share your trip status with a trusted contact</li>
                <li>Sit in the back seat when possible</li>
                <li>Don't share personal information beyond what's necessary</li>
              </ul>
            </section>

            {/* Physical Work Safety */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <HardHat className="w-6 h-6 text-primary" />
                Physical Work & Trade Safety
              </h2>

              <h3 className="text-xl font-semibold mb-3">Personal Protective Equipment (PPE)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Eye protection:</strong> Safety glasses for tasks with debris or chemicals</li>
                <li><strong>Hand protection:</strong> Appropriate gloves for the task type</li>
                <li><strong>Foot protection:</strong> Steel-toed boots for heavy lifting or construction</li>
                <li><strong>Head protection:</strong> Hard hats for overhead hazards</li>
                <li><strong>Hearing protection:</strong> For tasks with loud equipment</li>
                <li><strong>Respiratory protection:</strong> Masks for dusty or chemical environments</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Safe Work Practices</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use proper lifting techniques (lift with your legs, not your back)</li>
                <li>Take regular breaks to prevent fatigue</li>
                <li>Stay hydrated, especially in hot conditions</li>
                <li>Know how to use tools and equipment safely</li>
                <li>Don't perform tasks beyond your skill level</li>
                <li>Report any unsafe conditions to the Task Giver</li>
                <li>Don't work on ladders or heights without proper safety measures</li>
              </ul>
            </section>

            {/* Meeting Strangers */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Meeting for the First Time
              </h2>
              <p className="text-muted-foreground mb-4">
                When meeting someone for the first time through SaskTask:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li><strong>Public meeting:</strong> Consider meeting in a public place first for larger or extended tasks</li>
                <li><strong>Daytime preferred:</strong> Schedule initial meetings during daylight hours when possible</li>
                <li><strong>Buddy system:</strong> For first-time in-person meetings, consider having someone accompany you</li>
                <li><strong>Check-in system:</strong> Arrange to text a friend at specific times during the task</li>
                <li><strong>Trust ratings:</strong> Pay attention to reviews and verification badges</li>
              </ul>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Red Flags to Watch For</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  <li>Requests to meet at unusual locations or times</li>
                  <li>Pressure to communicate outside the platform</li>
                  <li>Requests for personal information unrelated to the task</li>
                  <li>Aggressive or threatening language</li>
                  <li>Profile doesn't match the person you meet</li>
                  <li>Requests for payment outside the platform</li>
                  <li>Scope of work significantly different from the listing</li>
                </ul>
              </div>
            </section>

            {/* COVID/Health Safety */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4">Health & Hygiene</h2>
              <p className="text-muted-foreground mb-4">
                Maintain good health and hygiene practices during in-person tasks:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Wash or sanitize hands before and after tasks</li>
                <li>Stay home if you're feeling unwell</li>
                <li>Respect any health-related requests from Task Givers or Doers</li>
                <li>Maintain appropriate personal hygiene</li>
                <li>Clean up after yourself upon task completion</li>
              </ul>
            </section>

            {/* What NOT to Do */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                What NOT to Do
              </h2>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">Don't ignore warning signs or red flags</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">Don't share your home address or personal information unnecessarily</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">Don't accept tasks that seem suspicious or too good to be true</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">Don't perform work while impaired by alcohol or drugs</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">Don't take payment outside the SaskTask platform</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">Don't hesitate to cancel or leave if you feel unsafe</p>
                </div>
              </div>
            </section>

            {/* Reporting */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Phone className="w-6 h-6 text-primary" />
                Reporting Safety Concerns
              </h2>
              <p className="text-muted-foreground mb-4">
                If you experience or witness any safety concerns:
              </p>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Emergency</h4>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-300">911</p>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-1">For immediate danger or crime in progress</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">SaskTask Safety</h4>
                  <a href="mailto:safety@sasktask.com" className="text-lg font-bold text-primary hover:underline">safety@sasktask.com</a>
                  <p className="text-sm text-muted-foreground mt-1">For non-emergency safety concerns</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">What to Include in Your Report</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your account information and the task details</li>
                <li>The other party's username and profile information</li>
                <li>Date, time, and location of the incident</li>
                <li>Detailed description of what happened</li>
                <li>Any evidence (screenshots, photos, messages)</li>
                <li>Names of any witnesses</li>
              </ul>
            </section>

            {/* SaskTask Safety Features */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                SaskTask Safety Features
              </h2>
              <p className="text-muted-foreground mb-4">
                We've built several features to help keep you safe:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Identity Verification:</strong> Users can verify their identity with government ID</li>
                <li><strong>Background Checks:</strong> Available for Task Doers in applicable categories</li>
                <li><strong>Reviews & Ratings:</strong> See feedback from previous task experiences</li>
                <li><strong>In-App Messaging:</strong> Communicate safely without sharing personal contact info</li>
                <li><strong>Payment Protection:</strong> Secure escrow payments through the platform</li>
                <li><strong>24/7 Support:</strong> Our team is available to help with safety concerns</li>
                <li><strong>Location Sharing:</strong> Optional real-time location for Instant Work tasks</li>
                <li><strong>Report Function:</strong> Easy reporting of suspicious behavior or content</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Safety Resources
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">SaskTask Safety Team</h4>
                  <p className="text-muted-foreground text-sm">
                    Email: <a href="mailto:safety@sasktask.com" className="text-primary hover:underline">safety@sasktask.com</a><br />
                    Available 24/7 for urgent safety concerns
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Saskatchewan Resources</h4>
                  <p className="text-muted-foreground text-sm">
                    Police Non-Emergency: <a href="tel:3069755555" className="text-primary hover:underline">(306) 975-5555</a><br />
                    Victim Services: <a href="tel:3069338477" className="text-primary hover:underline">(306) 933-8477</a>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
