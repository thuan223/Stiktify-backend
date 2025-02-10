interface IReportResult {
    report: IReport[],
    videoId: string,
}

interface IReport {
    userId: string,
    reasons: string,
}