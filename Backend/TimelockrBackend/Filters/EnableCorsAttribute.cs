using Microsoft.AspNetCore.Mvc.Filters;

namespace TimelockrBackend.Filters
{
    public class EnableCorsAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            context.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            context.HttpContext.Response.Headers.Add("Access-Control-Expose-Headers", "errortype");
        }
    }
}