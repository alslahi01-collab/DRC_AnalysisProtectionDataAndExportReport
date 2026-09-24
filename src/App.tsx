import React, { useState } from 'react';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ToolAnalysisView } from './components/ToolAnalysisView';
import { ConsolidatedAnalysisView } from './components/ConsolidatedAnalysisView';
import { ProtectionRiskMatrix } from './components/ProtectionRiskMatrix';
import { StandardsAndGaps } from './components/StandardsAndGaps';
import { RecommendationsView } from './components/RecommendationsView';
import { RawDataExplorer } from './components/RawDataExplorer';
import { PrintableReport } from './components/PrintableReport';
import { ExportCenterView } from './components/ExportCenterView';
import { ExportModal } from './components/ExportModal';
import { DataImportAndStatsView } from './components/DataImportAndStatsView';
import { RapidProtectionAssessmentReport } from './components/RapidProtectionAssessmentReport';
import { DemographicCase, INITIAL_DEMOGRAPHIC_CASES } from './data/demographicCases';
import { LocationFilter } from './types';
import { ShieldCheck, HeartHandshake, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('data_import');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [demographicCases, setDemographicCases] = useState<DemographicCase[]>([]);

  const distinctFilesCount = Array.from(new Set(demographicCases.map(c => c.sourceFile))).length;
  const availableLocations = Array.from(new Set(demographicCases.map(c => c.location?.trim()))).filter(Boolean);

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print dialog error:', err);
    }
  };

  const handleNavigateToUpload = () => {
    setActiveTab('data_import');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-rose-100 selection:text-rose-900">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        onPrintReport={handlePrint}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        casesCount={demographicCases.length}
        filesCount={distinctFilesCount}
        availableLocations={availableLocations}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            locationFilter={locationFilter}
            onNavigateToTab={setActiveTab}
            cases={demographicCases}
          />
        )}

        {activeTab === 'data_import' && (
          <DataImportAndStatsView
            cases={demographicCases}
            setCases={setDemographicCases}
            onNavigateToRpa={() => setActiveTab('rpa_report')}
          />
        )}

        {activeTab === 'rpa_report' && (
          <RapidProtectionAssessmentReport
            cases={demographicCases}
          />
        )}

        {activeTab === 'tools' && (
          <ToolAnalysisView
            cases={demographicCases}
            onNavigateToUpload={handleNavigateToUpload}
          />
        )}

        {activeTab === 'consolidated' && (
          <ConsolidatedAnalysisView
            cases={demographicCases}
            onNavigateToUpload={handleNavigateToUpload}
          />
        )}

        {activeTab === 'risk_matrix' && (
          <ProtectionRiskMatrix
            cases={demographicCases}
            onNavigateToUpload={handleNavigateToUpload}
          />
        )}

        {activeTab === 'standards' && (
          <StandardsAndGaps
            cases={demographicCases}
            onNavigateToUpload={handleNavigateToUpload}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            cases={demographicCases}
            onNavigateToUpload={handleNavigateToUpload}
          />
        )}

        {activeTab === 'explorer' && (
          <RawDataExplorer
            cases={demographicCases}
            onNavigateToUpload={handleNavigateToUpload}
          />
        )}

        {activeTab === 'printable' && (
          <PrintableReport
            cases={demographicCases}
            onNavigateToUpload={handleNavigateToUpload}
            availableLocations={availableLocations}
            initialLocationFilter={locationFilter}
          />
        )}

        {activeTab === 'export_center' && (
          <ExportCenterView
            currentLocationFilter={locationFilter}
            onOpenPrintView={handlePrint}
            availableLocations={availableLocations}
            cases={demographicCases}
          />
        )}
      </main>

      {/* Quick Export Modal Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultLocation={locationFilter}
        onPrintPreview={handlePrint}
        availableLocations={availableLocations}
      />

      {/* Footer (hidden during print) */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              منظومة رصد الحماية الإنسانية - متوافقة مع ميثاق معايير إسفير (Sphere)، ومعايير حماية الطفل (CPMS)، وإرشادات IASC والمعيار الإنساني الأساسي (CHS)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>قطاع الحماية الإنسانية (Protection Sector)</span>
            <span>•</span>
            <span>DRC / Protection Cluster Partners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
