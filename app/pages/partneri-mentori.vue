<template>
  <div class="mt-20 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
      Partneri
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      <UiPartnerCard
        image="/test_logo.png"
        alt="Partner 1"
        name="Partner Firm 1"
        description="Leading company in digital solutions helping startups grow globally."
      />
      <UiPartnerCard
        image="/test_logo.png"
        alt="Partner 2"
        name="Partner Firm 2"
        description="Experts in design and marketing strategies for modern businesses."
      />
      <UiPartnerCard
        image="/test_logo.png"
        alt="Partner 3"
        name="Partner Firm 3"
        description="Software development company delivering scalable global solutions."
      />
      <UiPartnerCard
        image="/test_logo.png"
        alt="Partner 4"
        name="Partner Firm 4"
        description="Consulting firm focused on sustainable growth and strategy."
      />
    </div>
  </div>

  <div class="mt-20 px-6 md:px-0">
    <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">
      Mentori
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <UiTeamCard
        image=""
        alt="Alex Novak"
        name="Alex Novak"
        role="Lead Designer"
      />
      <UiTeamCard
        image=""
        alt="Jane Doe"
        name="Jane Doe"
        role="Frontend Developer"
      />
      <UiTeamCard
        image=""
        alt="John Smith"
        name="John Smith"
        role="Project Manager"
      />
      <UiTeamCard
        image=""
        alt="Maria Ivanova"
        name="Maria Ivanova"
        role="UX Designer"
      />
    </div>

    <div class="mt-16 px-6 md:px-0">
  <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-12 text-center md:text-left">Referencie</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    <UiReferenceCard
      image="/team/person1.jpg"
      name="Peter Horváth"
      role="CEO Partner Firm 1"
      quote="NTI nám pomohlo nájsť talentovaných dizajnérov pre naše projekty."
    />
    <UiReferenceCard
      image="/team/person2.jpg"
      name="Mária Nováková"
      role="Lead Designer"
      quote="Spolupráca s NTI mentorom bola nesmierne prínosná pre náš tím."
    />
    <UiReferenceCard
      image="/team/person3.jpg"
      name="Ján Kováč"
      role="Project Manager"
      quote="Odporúčam NTI ako spoľahlivú platformu pre získavanie talentov."
    />
  </div>
</div>
   
  </div>
</template>

<script setup>
  useSeoMeta({
    title: 'Partneri a mentori | NTI',
    description: 'Spoznajte našich partnerov a mentorov, ktorí podporujú náš projekt a pomáhajú rásť talentom v oblasti vývoja.'
});
</script>