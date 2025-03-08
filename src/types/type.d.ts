interface IReportResult {
    report: IReport[],
    videoId: string,
    musicId: string,
}

interface IReport {
    userId: string,
    reasons: string,
}